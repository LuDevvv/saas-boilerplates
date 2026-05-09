import React from "react";
import { useLocation, Navigate } from "react-router-dom";

import Loading from "@/components/ui/Loading";
import { useAuth } from "@/hooks/stores/useAuth";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // 1. Si no está autenticado (o el perfil cargó como null), al login
  if (!isAuthenticated || (!isLoading && user === null)) {
    return (
      <Navigate to="/auth/sign-in" state={{ from: currentPath }} replace />
    );
  }

  // Si está cargando el perfil de usuario (y estamos autenticados), mostramos el loading
  if (isLoading || (isAuthenticated && !user)) {
    return <Loading />;
  }

  return children;
};

export default ProtectedRoute;
