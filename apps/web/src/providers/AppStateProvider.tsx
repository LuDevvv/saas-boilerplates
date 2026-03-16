import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useUI } from "../hooks/useUI";

/**
 * AppStateProvider Component.
 * Orchestrates the application state hydration.
 * This component handles authentication and state synchronization inside the React tree.
 */
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  // This hook handles the initial data fetching and store hydration
  useAuth();
  const ui = useUI();

  // Sync Vanilla JS events back to Zustand
  useEffect(() => {
    const handleSidebarChange = (e: any) => {
      ui.setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener("sidebar-state-change", handleSidebarChange);
    return () =>
      window.removeEventListener("sidebar-state-change", handleSidebarChange);
  }, [ui]);

  return <>{children}</>;
}
