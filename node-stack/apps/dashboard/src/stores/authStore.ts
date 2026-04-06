import { AsyncState, handleStoreError } from "@/utils/storeUtils";
import type { User } from "@/types/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth/authService";
import { apiClient } from "@/lib/api-client";

interface AuthState extends AsyncState {
  isAuthenticated: boolean;
  user: User | null;
  pendingVerificationEmail?: string;

  login: (credentials: any) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  updateAuthState: (payload: any | null) => void;
  clearError: () => void;
  setPendingVerificationEmail: (email: string | undefined) => void;

  // Social & Verifications
  loginWithGoogle: () => void;
  handleSocialCallback: (payload: any) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  resendVerificationCode: (email: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
}

/**
 * Maps the user from response ensuring dates are Date objects
 */
const mapUserFromResponse = (data: any): User => ({
  ...data,
  createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
  updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
  memberships: data.memberships || [],
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
      pendingVerificationEmail: undefined,

      clearError: () => set({ error: null }),

      updateAuthState: (payload) => {
        if (!payload) {
          apiClient.removeToken();
          set({ user: null, isAuthenticated: false });
          return;
        }

        const data = payload.user || payload.data?.user || payload;
        const user = mapUserFromResponse(data);

        set({
          user,
          isAuthenticated: true,
          error: null,
        });
      },

      checkAuthStatus: async () => {
        set({ loading: true, error: null });
        try {
          const response = await authService.checkStatus();
          if (response) {
            get().updateAuthState(response);
            return true;
          }
          return false;
        } catch (error) {
          const errorData = handleStoreError(error);
          if (errorData.statusCode === 401) {
            get().updateAuthState(null);
          }
          return false;
        } finally {
          set({ loading: false });
        }
      },

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.login(credentials);
          
          const responseData = response as any;
          const token = responseData.token || responseData.data?.token;

          if (token) apiClient.setToken(token);
          get().updateAuthState(responseData);

          if (responseData.user && !responseData.user.isEmailVerified) {
            set({ pendingVerificationEmail: responseData.user.email || credentials.email });
          }

          return true;
        } catch (error) {
          const errorData = handleStoreError(error);
          set({ error: errorData });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.register(userData);
          const responseData = response as any;

          if (responseData.requiresVerification) {
            set({ pendingVerificationEmail: userData.email });
          } else {
            const token = responseData.token || responseData.data?.token;
            if (token) apiClient.setToken(token);
            get().updateAuthState(responseData);
          }
          return true;
        } catch (error) {
          set({ error: handleStoreError(error) });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          apiClient.removeToken();
          set({ user: null, isAuthenticated: false, pendingVerificationEmail: undefined });
          window.location.href = "/auth/sign-in";
        }
      },

      setPendingVerificationEmail: (email) => set({ pendingVerificationEmail: email }),

      loginWithGoogle: () => {
        // This would typically redirect to a backend URL
        window.location.href = `${import.meta.env["VITE_API_URL"]}/auth/google`;
      },

      handleSocialCallback: async (payload) => {
        set({ loading: true, error: null });
        try {
          const token = typeof payload === "string" ? payload : payload.token || payload.data?.token;

          if (token) {
            apiClient.setToken(token);
            await get().checkAuthStatus();
          } else {
            throw new Error("No token received from social provider");
          }
        } catch (error) {
          const errorData = handleStoreError(error);
          set({ error: errorData });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      verifyEmail: async (email, code) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.verifyEmail(email, code);
          const responseData = response as any;
          const token = responseData.token || responseData.data?.token;

          if (token) apiClient.setToken(token);
          get().updateAuthState(responseData);
          set({ pendingVerificationEmail: undefined });
          return true;
        } catch (error) {
          set({ error: handleStoreError(error) });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      resendVerificationCode: async (email) => {
        set({ loading: true, error: null });
        try {
          await authService.resendVerificationCode(email);
          return true;
        } catch (error) {
          set({ error: handleStoreError(error) });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      requestPasswordReset: async (email) => {
        set({ loading: true, error: null });
        try {
          await authService.requestPasswordReset(email);
          return true;
        } catch (error) {
          set({ error: handleStoreError(error) });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      resetPassword: async (token, password) => {
        set({ loading: true, error: null });
        try {
          await authService.resetPassword(token, password);
          return true;
        } catch (error) {
          set({ error: handleStoreError(error) });
          return false;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        pendingVerificationEmail: state.pendingVerificationEmail,
      }),
    }
  )
);
