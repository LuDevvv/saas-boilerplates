import React, { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Loading from "@/components/Loading";
import { useAuth } from "@/hooks/stores/useAuth";

interface PublicRouteProps {
  children: JSX.Element;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  const [initialLoad, setInitialLoad] = useState(() => {
    return !sessionStorage.getItem("hasSeenIntroAnimation");
  });
  const [isFading, setIsFading] = useState(() => {
    return !sessionStorage.getItem("hasSeenIntroAnimation");
  });

  const hasRun = useRef(false); // 👈 evita reutilizar el fade

  // Delay inicial 2s — solo 1 vez
  useEffect(() => {
    if (!initialLoad) return;
    if (hasRun.current) return; // 👈 evita repetir en producción

    // Marcamos INMEDIATAMENTE de que ya se "vio" (o se intentó ver) la animación
    // Así si la página se recarga a mitad del proceso, ya no vuelve a salir.
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

    // Si ya habia cargado inicialmente (es decir, entramos directo sin animacion),
    // nos aseguramos que isFading sea false inmediatamente si no lo es
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
    // Si no tenemos el objeto user todavía, esperamos a que se cargue (evita redirecciones erróneas)
    if (!user) {
      return <Loading />;
    }

    const isVerifyEmail = location.pathname === "/auth/verify-email";
    const needsVerification = !user.isEmailVerified && user.provider !== "google";

    // Si está en verify-email y necesita verificación, permitir acceso (render children)
    if (isVerifyEmail && needsVerification) {
      return children;
    }

    // Si ya está verificado o no está en verify-email, lo mandamos al home
    // El ProtectedRoute en "/" se encargará de cualquier redirección adicional.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
