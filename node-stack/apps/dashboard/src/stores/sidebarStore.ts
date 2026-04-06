import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarState {
  // Estado de colapso de la barra lateral (escritorio)
  isCollapsed: boolean;

  // Estado de apertura de la barra lateral móvil
  isMobileOpen: boolean;

  // Submenús expandidos (clave por la ruta del elemento del menú)
  expandedMenus: Set<string>;

  // Acciones
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapse: () => void;

  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
  openMobile: () => void;
  closeMobile: () => void;

  toggleSubmenu: (path: string) => void;
  setSubmenuExpanded: (path: string, expanded: boolean) => void;
  isSubmenuExpanded: (path: string) => boolean;

  // Reiniciar todo el estado
  reset: () => void;
}

const initialState = {
  isCollapsed: false,
  isMobileOpen: false,
  expandedMenus: new Set<string>(),
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Acciones de colapso
      setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
      toggleCollapse: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),

      // Acciones de móvil
      setMobileOpen: (open: boolean) => set({ isMobileOpen: open }),
      toggleMobile: () =>
        set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      openMobile: () => set({ isMobileOpen: true }),
      closeMobile: () => set({ isMobileOpen: false }),

      // Acciones de submenú
      toggleSubmenu: (path: string) => {
        set((state) => {
          const newExpandedMenus = new Set(state.expandedMenus);
          if (newExpandedMenus.has(path)) {
            newExpandedMenus.delete(path);
          } else {
            newExpandedMenus.add(path);
          }
          return { expandedMenus: newExpandedMenus };
        });
      },

      setSubmenuExpanded: (path: string, expanded: boolean) => {
        set((state) => {
          const newExpandedMenus = new Set(state.expandedMenus);
          if (expanded) {
            newExpandedMenus.add(path);
          } else {
            newExpandedMenus.delete(path);
          }
          return { expandedMenus: newExpandedMenus };
        });
      },

      isSubmenuExpanded: (path: string) => {
        return get().expandedMenus.has(path);
      },

      // Reiniciar
      reset: () => set(initialState),
    }),
    {
      name: "sidebar-storage",
      storage: createJSONStorage(() => localStorage),
      // Serialización personalizada para Set
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        expandedMenus: Array.from(state.expandedMenus),
      }),
      // Deserialización personalizada para Set
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        expandedMenus: new Set(persistedState?.expandedMenus || []),
      }),
    }
  )
);
