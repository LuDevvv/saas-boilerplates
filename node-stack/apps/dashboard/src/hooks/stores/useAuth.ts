import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { appToast } from "@/components/alerts/Toasts";
import { useUser } from "@/features/auth/hooks/useUser";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export const useAuth = () => {
  const isAuthenticated = useAuthStore(useShallow((state) => state.isAuthenticated));
  const clearUser = useAuthStore(useShallow((state) => state.clearUser));

  const { data: user, isLoading } = useUser();

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      clearUser(); // clears tokens + redirects via window.location
    }
  };

  const loginWithGoogle = async () => {
    appToast.info({
      title: "Google Auth",
      description: "La autenticacion con Google no esta configurada en este boilerplate aun.",
    });
  };

  const isPremium = user?.subscriptions?.some(s => s.status === "active") || false;
  const currentPlan = user?.subscriptions?.find(s => s.status === "active") || null;

  // If the server returns null after a successful token check, the session has expired.
  useEffect(() => {
    if (!isLoading && user === null && isAuthenticated) {
      clearUser();
    }
  }, [isLoading, user, isAuthenticated, clearUser]);

  return {
    user,
    isAuthenticated,
    isPremium,
    currentPlan,
    isLoading,
    logout,
    loginWithGoogle,
  };
};
