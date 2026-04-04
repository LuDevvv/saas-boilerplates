import { create } from "zustand";
import type { UIState, Theme } from "../types";

interface UIStore extends UIState {
  setTheme: (theme: Theme) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  initialize: () => void;
}

/**
 * UI Store.
 * Manages global UI configuration settings like theme and layout states.
 */
export const useUIStore = create<UIStore>((set, get) => ({
  theme: "system",
  isSidebarCollapsed: false,
  isLoading: true,

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      const isDark =
        theme === "dark" ||
        (theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", isDark);
    }
  },

  setSidebarCollapsed: (collapsed) => {
    set({ isSidebarCollapsed: collapsed });
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", collapsed ? "true" : "false");
      document.documentElement.classList.toggle("sidebar-collapsed", collapsed);
    }
  },

  toggleSidebar: () => {
    const { isSidebarCollapsed } = get();
    get().setSidebarCollapsed(!isSidebarCollapsed);
  },

  setLoading: (loading) => set({ isLoading: loading }),

  initialize: () => {
    if (typeof window === "undefined") return;

    const storedTheme = localStorage.getItem("theme") as Theme;
    if (storedTheme) {
      get().setTheme(storedTheme);
    }

    const storedSidebar = localStorage.getItem("sidebar-collapsed");
    if (storedSidebar !== null) {
      get().setSidebarCollapsed(storedSidebar === "true");
    }

    set({ isLoading: false });
  },
}));
