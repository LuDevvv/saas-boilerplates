import { AsyncState, handleStoreError } from "@/utils/storeUtils";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth/authService";
import { cookieTokenStorage } from "@/lib/api-client";
import { User, LoginDto, RegisterDto } from "@/types/auth";

interface AuthState extends AsyncState {
  isAuthenticated: boolean;
  user: User | null;
  pendingVerificationEmail?: string;

  login: (credentials: LoginDto) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  handleGoogleCallback: (token: string) => Promise<boolean>;
  register: (userData: RegisterDto) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  updateAuthState: (payload: any | null) => void;
  clearError: () => void;
  
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  resendVerificationCode: (email: string) => Promise<boolean>;
  setPendingVerificationEmail: (email?: string) => void;
  
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
      pendingVerificationEmail: undefined,

      clearError: () => set({ error: null }),

      setPendingVerificationEmail: (email) => set({ pendingVerificationEmail: email }),

      updateAuthState: (payload: any | null) => {
        if (!payload) {
          cookieTokenStorage.removeToken();
          set({ user: null, isAuthenticated: false });
          return;
        }

        const user = payload.user || payload;
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

      login: async (credentials: LoginDto) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.login(credentials);
          const token = response.token;

          if (token) cookieTokenStorage.setToken(token);
          get().updateAuthState(response);

          return true;
        } catch (error) {
          set({ error: handleStoreError(error) });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      loginWithGoogle: async () => {
        await authService.loginWithGoogle();
      },

      handleGoogleCallback: async (token: string) => {
        set({ loading: true, error: null });
        try {
          cookieTokenStorage.setToken(token);
          const response = await authService.checkStatus();
          if (response) {
            get().updateAuthState(response);
            return true;
          }
          return false;
        } catch (error) {
          set({ error: handleStoreError(error) });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      register: async (userData: RegisterDto) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.register(userData);
          const token = response.token;
          
          if (token) cookieTokenStorage.setToken(token);
          
          // If response has user, we login immediately
          // In some flows, registration might leave user in "pending verification"
          get().updateAuthState(response);
          
          return true;
        } catch (error) {
          set({ error: handleStoreError(error) });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      verifyEmail: async (email: string, code: string) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.verifyEmail(email, code);
          get().updateAuthState(response);
          return true;
        } catch (error) {
          set({ error: handleStoreError(error) });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      resendVerificationCode: async (email: string) => {
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

      requestPasswordReset: async (email: string) => {
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

      resetPassword: async (token: string, password: string) => {
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

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          cookieTokenStorage.removeToken();
          set({ user: null, isAuthenticated: false, pendingVerificationEmail: undefined });
          window.location.href = "/auth/sign-in";
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state: AuthState) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        pendingVerificationEmail: state.pendingVerificationEmail,
      }),
    }
  )
);
