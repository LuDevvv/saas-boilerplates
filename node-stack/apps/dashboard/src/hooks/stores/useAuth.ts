import { useAuthStore } from "@stores/authStore";

export const useAuth = () => {
  const {
    isAuthenticated,
    user,
    loading,
    login,
    loginWithGoogle,
    handleGoogleCallback,
    register,
    logout,
    updateAuthState,
    clearError,
    error,
    checkAuthStatus,
    verifyEmail,
    resendVerificationCode,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    requestPasswordReset,
    resetPassword,
  } = useAuthStore();

  return {
    isAuthenticated,
    user,
    loading,
    login,
    loginWithGoogle,
    handleGoogleCallback,
    register,
    logout,
    updateAuthState,
    clearError,
    error,
    checkAuthStatus,
    verifyEmail,
    resendVerificationCode,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    requestPasswordReset,
    resetPassword,
    
    // Boilerplate placeholders
    isPremium: false,
    currentPlan: null,
    isSubscriptionLoading: false,
  };
};
