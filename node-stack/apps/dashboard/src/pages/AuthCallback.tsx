import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import Loading from "@/components/Loading";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Verifica si hay un error en la URL (redirigido desde backend)
        const urlParams = new URLSearchParams(window.location.search);
        const errorCode = urlParams.get("error");
        const errorMessage = urlParams.get("message");

        if (errorCode) {
          setError(errorMessage || "Error de autenticación");
          setLoading(false);
          return;
        }

        // Procesar el token
        const token = urlParams.get("token");

        if (!token) {
          setError("No se recibió token de autenticación");
          setLoading(false);
          navigate("/auth/sign-in", { replace: true });
          return;
        }

        await handleGoogleCallback(token);
        
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Error en AuthCallback:", error);
        setError(
          "Error inesperado: " +
            (error instanceof Error ? error.message : String(error))
        );
        setLoading(false);
        navigate("/auth/sign-in", { replace: true });
      }
    };

    processCallback();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return null;
};

export default AuthCallback;
