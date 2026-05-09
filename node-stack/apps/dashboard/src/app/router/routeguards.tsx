import { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";

import Loading from "@/components/ui/Loading";
import { useAuth } from "@/hooks/stores/useAuth";

export const protectedGuard = (element: ReactElement): ReactElement => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  return element;
};

export const guestGuard = (element: ReactElement): ReactElement => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export const adminGuard = (element: ReactElement): ReactElement => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  const isAdmin = user?.role === "admin" || user?.role === "super_admin" || !!(user as { isAdmin?: boolean })?.isAdmin;

  if (!user || !isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return element;
};