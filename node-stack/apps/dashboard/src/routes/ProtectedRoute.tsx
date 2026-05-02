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

  // Si está cargando el perfil de usuario (y estamos autenticados), mostramos el loading
  if (isAuthenticated && isLoading) {
    return <Loading />;
  }

  // 1. Si no está autenticado, al login
  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/sign-in" state={{ from: currentPath }} replace />
    );
  }

  // Si está autenticado pero el objeto user no está listo aún, esperamos
  if (!user && isAuthenticated) {
     return <Loading />;
  }

  return children;
};

export default ProtectedRoute;
