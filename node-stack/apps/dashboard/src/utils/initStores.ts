import { useAuthStore } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";

/**
 * Initializes all necessary stores for the application.
 */
export const initializeStores = async (): Promise<boolean> => {
  try {
    const isAuthenticated = await useAuthStore.getState().checkAuthStatus();
    return isAuthenticated;
  } catch (error) {
    console.error("Failed to initialize stores:", error);
    return false;
  }
};

/**
 * Resets all stores to their initial state.
 * Useful for logout, session expiration, etc.
 */
export const resetStores = () => {
  useAuthStore.getState().updateAuthState(null);
  useSidebarStore.getState().reset();
};

export const initApp = async (): Promise<boolean> => {
  return await initializeStores();
};
