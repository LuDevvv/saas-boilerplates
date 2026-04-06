import { useAuthStore } from "@/stores/authStore";

/**
 * Generic useAuth hook that provides a clean interface for session management.
 */
export const useAuth = () => {
  const {
    isAuthenticated,
    user,
    loading,
    pendingVerificationEmail,
    login,
    register,
    logout,
    updateAuthState,
    clearError,
    error,
    checkAuthStatus,
    setPendingVerificationEmail,
    loginWithGoogle,
    handleSocialCallback,
    verifyEmail,
    resendVerificationCode,
    requestPasswordReset,
    resetPassword,
  } = useAuthStore();

  // In the future, we can inject Workspace/Subscription status here
  // genericized to not depend on complex specialized stores.
  
  return {
    isAuthenticated,
    user,
    loading,
    pendingVerificationEmail,
    login,
    register,
    logout,
    updateAuthState,
    clearError,
    error,
    checkAuthStatus,
    setPendingVerificationEmail,
    loginWithGoogle,
    handleSocialCallback,
    verifyEmail,
    resendVerificationCode,
    requestPasswordReset,
    resetPassword,
    
    // Generic placeholders for future portability
    isPremium: false, 
    activeWorkspaceId: localStorage.getItem("active_workspace_id"),
  };
};
