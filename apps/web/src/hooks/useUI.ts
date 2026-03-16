import { useUIStore } from "../stores/useUIStore";

/**
 * useUI Hook.
 * Bridge between UI components and the UI configuration store.
 */
export function useUI() {
  const {
    theme,
    isSidebarCollapsed,
    isLoading,
    setTheme,
    setSidebarCollapsed,
    toggleSidebar,
  } = useUIStore();

  return {
    theme,
    isSidebarCollapsed,
    isLoading,
    setTheme,
    setSidebarCollapsed,
    toggleSidebar,
  };
}
