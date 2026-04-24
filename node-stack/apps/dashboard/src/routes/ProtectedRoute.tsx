import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import Loading from "@/components/Loading";
import { useAuthStore } from "@/stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuthStore();
  const location = useLocation();
  const currentPath = location.pathname;

  // Si está cargando el estado inicial de auth, mostramos el loading
  if (loading) {
    return <Loading />;
  }

  // 1. Si no está autenticado, al login
  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/sign-in" state={{ from: currentPath }} replace />
    );
  }

  // Si está autenticado pero el objeto user no está listo aún, esperamos (aunque usualmente vienen juntos)
  if (!user && loading) {
    return <Loading />;
  }

  return children;
};

export default ProtectedRoute;
