import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import Loading from "@/components/Loading";
import { useAuthStore } from "@/stores/authStore";

interface ProtectedRouteProps {
  children: JSX.Element;
}

/**
 * Generic implementation of a Protected Route.
 * Redirects to login if not authenticated or not email-verified.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuthStore();
  const location = useLocation();
  const currentPath = location.pathname;

  // Onboarding routes that are partially accessible
  const isPublicOnboarding =
    currentPath === "/auth/verify-email" ||
    currentPath === "/setup"; // Generic setup page

  // 1. Initial Loading State
  if (loading) {
    return <Loading />;
  }

  // 2. Not Authenticated check
  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/sign-in" state={{ from: currentPath }} replace />
    );
  }

  // 3. User object Not Ready check
  if (!user) {
    return <Loading />;
  }

  // 4. Email Verification check (Blocking if not verified)
  if (!user.isEmailVerified && !isPublicOnboarding) {
    const emailParam = user.email ? `?email=${encodeURIComponent(user.email)}` : "";
    return <Navigate to={`/auth/verify-email${emailParam}`} replace />;
  }

  return (
    <>
      {children}
    </>
  );
};

export default ProtectedRoute;
