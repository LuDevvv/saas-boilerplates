import type { UserEntity } from "@node-stack/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { cookieTokenStorage } from "@/lib/cookie-storage";

interface AuthState {
  user: UserEntity | null;
  isAuthenticated: boolean;
  setUser: (user: UserEntity) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => {
        set({ user: null, isAuthenticated: false });
        // Clear tokens from cookie storage (dashboard) and localStorage (api-client interceptor)
        try { cookieTokenStorage.clear(); } catch { /* SSR */ }
        try {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("refresh_token");
        } catch { /* SSR */ }
        // React Router's ProtectedRoute will automatically catch the state change
        // and safely redirect to /auth/sign-in without a harsh full-page reload.
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Respond to the api-client interceptor's hard-logout signal (second 401 on token refresh)
if (typeof window !== "undefined") {
  window.addEventListener("auth:logout", () => {
    useAuthStore.getState().clearUser();
  });
}
