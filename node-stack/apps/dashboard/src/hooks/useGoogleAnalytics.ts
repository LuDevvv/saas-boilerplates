import { useEffect } from "react";

// Tipos para Google Analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Hook para inicializar Google Analytics
 * @param trackingId - ID de seguimiento de Google Analytics (G-XXXXXXXXXX)
 * @param enabled - Si está habilitado o no (útil para desarrollo vs producción)
 */
export const useGoogleAnalytics = (
  trackingId: string = "G-PH3E1284PB",
  enabled: boolean = import.meta.env.PROD
) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Verificar si gtag ya está cargado
    if (typeof window.gtag === "function") {
      return;
    }

    // Inicializar dataLayer
    window.dataLayer = window.dataLayer || [];

    // Función gtag
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }

    window.gtag = gtag;

    // Configuración inicial
    gtag("js", new Date());
    gtag("config", trackingId, {
      send_page_view: true,
      anonymize_ip: true, // Anonimizar IP para GDPR
    });

    // Cargar el script de Google Analytics
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    return () => {
      // Cleanup si es necesario
    };
  }, [trackingId, enabled]);

  return {
    isEnabled: enabled,
    trackingId,
  };
};
