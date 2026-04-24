import React, { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import Loading from "@/components/Loading";
import { useAuth } from "@/hooks/stores/useAuth";

interface PublicRouteProps {
  children: React.ReactElement;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  const [initialLoad, setInitialLoad] = useState(() => {
    return !sessionStorage.getItem("hasSeenIntroAnimation");
  });
  const [isFading, setIsFading] = useState(() => {
    return !sessionStorage.getItem("hasSeenIntroAnimation");
  });

  const hasRun = useRef(false);

  // Delay inicial 2s — solo 1 vez
  useEffect(() => {
    if (!initialLoad) return;
    if (hasRun.current) return;

    sessionStorage.setItem("hasSeenIntroAnimation", "true");

    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 2000);

    hasRun.current = true;
    return () => clearTimeout(timer);
  }, [initialLoad]);

  // Fade — solo 1 vez
  useEffect(() => {
    if (initialLoad) return;
    if (!isFading && !initialLoad) return;

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setIsFading(false);
      });
    } else {
      setIsFading(false);
    }
  }, [initialLoad]);

  if (loading || initialLoad || isFading) {
    return <Loading />;
  }

  // Si ya se terminó el initial load y fading, evaluamos el estado de autenticación
  if (isAuthenticated) {
    if (!user) {
      return <Loading />;
    }

    // Generic dashboard doesn't force email verification for now
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
