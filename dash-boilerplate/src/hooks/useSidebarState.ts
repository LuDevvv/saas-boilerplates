import { useEffect } from "react";
import { useSidebarStore } from "@/stores/sidebarStore";

export const useSidebarState = () => {
  const {
    isCollapsed,
    isMobileOpen,
    toggleCollapse,
    toggleMobile,
    closeMobile,
    openMobile,
    setCollapsed,
    setMobileOpen,
  } = useSidebarStore();

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
