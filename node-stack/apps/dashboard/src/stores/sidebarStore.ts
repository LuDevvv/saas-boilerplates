import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarState {
  // Estado de colapso de la barra lateral (escritorio)
  isCollapsed: boolean;

  // Estado de hover de la barra lateral (cuando está colapsada)
  isHovered: boolean;

  // Estado de apertura de la barra lateral móvil
  isMobileOpen: boolean;

  // Submenús expandidos (clave por la ruta del elemento del menú)
  expandedMenus: Set<string>;

  // Estado de la paleta de comandos
  isCommandPaletteOpen: boolean;

  // Acciones
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapse: () => void;
  setHovered: (hovered: boolean) => void;

  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
  openMobile: () => void;
  closeMobile: () => void;

  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;

  toggleSubmenu: (path: string) => void;
  setSubmenuExpanded: (path: string, expanded: boolean) => void;
  isSubmenuExpanded: (path: string) => boolean;

  // Reiniciar todo el estado
  reset: () => void;
}

const initialState = {
  isCollapsed: false,
  isHovered: false,
  isMobileOpen: false,
  isCommandPaletteOpen: false,
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
      setHovered: (hovered: boolean) => set({ isHovered: hovered }),

      // Acciones de móvil
      setMobileOpen: (open: boolean) => set({ isMobileOpen: open }),
      toggleMobile: () =>
        set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      openMobile: () => set({ isMobileOpen: true }),
      closeMobile: () => set({ isMobileOpen: false }),

      // Acciones de paleta de comandos
      setCommandPaletteOpen: (open: boolean) => set({ isCommandPaletteOpen: open }),
      toggleCommandPalette: () =>
        set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),

      // Acciones de submenú (con lógica de acordeón)
      toggleSubmenu: (path: string) => {
        set((state) => {
          const newExpandedMenus = new Set<string>();
          // Si ya estaba abierto, al clickearlo se cierra (queda vacío)
          // Si estaba cerrado, se abre este y se cierran los demás
          if (!state.expandedMenus.has(path)) {
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
        isCommandPaletteOpen: false, // No persistimos el estado de la paleta
        expandedMenus: Array.from(state.expandedMenus),
      }),
      // Deserialización personalizada para Set
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        expandedMenus: new Set(persistedState?.expandedMenus || []),
      }),
    }
  )
);
