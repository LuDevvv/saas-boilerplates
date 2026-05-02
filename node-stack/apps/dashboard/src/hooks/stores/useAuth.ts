import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/features/auth/api/auth.api";
import { cookieTokenStorage } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { appToast } from "@/components/alerts/Toasts";
import { useUser } from "@/features/auth/hooks/useUser";
import { useShallow } from "zustand/react/shallow";

export const useAuth = () => {
  const token = useAuthStore(useShallow((state) => state.token));
  const isAuthenticated = useAuthStore(useShallow((state) => state.isAuthenticated));
  const clearStore = useAuthStore(useShallow((state) => state.logout));
  
  const { data: user, isLoading } = useUser();
  
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      clearStore();
      cookieTokenStorage.removeToken();
      navigate("/auth/sign-in");
    }
  };

  const loginWithGoogle = async () => {
    appToast.info({
      title: "Google Auth",
      description: "La autenticación con Google no está configurada en este boilerplate aún.",
    });
  };

  const isPremium = user?.subscriptions?.some(s => s.status === 'active') || false;
  const currentPlan = user?.subscriptions?.find(s => s.status === 'active') || null;

  return {
    user,
    token,
    isAuthenticated,
    isPremium,
    currentPlan,
    isLoading,
    logout,
    loginWithGoogle,
  };
};