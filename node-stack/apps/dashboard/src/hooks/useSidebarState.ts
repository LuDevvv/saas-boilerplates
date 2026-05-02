import { useEffect } from "react";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useShallow } from "zustand/react/shallow";

export const useSidebarState = () => {
  const isCollapsed = useSidebarStore(useShallow((state) => state.isCollapsed));
  const isMobileOpen = useSidebarStore(useShallow((state) => state.isMobileOpen));
  const toggleCollapse = useSidebarStore(useShallow((state) => state.toggleCollapse));
  const toggleMobile = useSidebarStore(useShallow((state) => state.toggleMobile));
  const closeMobile = useSidebarStore(useShallow((state) => state.closeMobile));
  const openMobile = useSidebarStore(useShallow((state) => state.openMobile));
  const setCollapsed = useSidebarStore(useShallow((state) => state.setCollapsed));
  const setMobileOpen = useSidebarStore(useShallow((state) => state.setMobileOpen));

  // Cerrar sidebar móvil al cambiar de ruta
  useEffect(() => {
    const handleRouteChange = () => {
      closeMobile();
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, [closeMobile]);

  // Prevenir scroll del body cuando sidebar móvil está abierto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  return {
    isCollapsed,
    isMobileOpen,
    toggleCollapse,
    toggleMobile,
    closeMobile,
    openMobile,
    setIsCollapsed: setCollapsed,
    setIsMobileOpen: setMobileOpen,
  };
};
