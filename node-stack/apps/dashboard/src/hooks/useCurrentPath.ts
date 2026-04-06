import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // o tu router

export const useCurrentPath = () => {
  const location = useLocation?.() || { pathname: window.location.pathname };
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  const isActivePath = (path: string) => currentPath === path;
  const isActiveSection = (paths: string[]) => paths.includes(currentPath);

  return {
    currentPath,
    isActivePath,
    isActiveSection,
  };
};
