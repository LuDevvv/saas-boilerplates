import { useCallback } from "react";

export type AnalyticsEventName =
  // autenticación
  | "login"
  | "logout"
  | "sign_up"
  | "password_reset"
  | "email_verified"

  // empresa/sucursal
  | "company_created"
  | "company_updated"
  | "branch_created"
  | "branch_updated"
  | "branch_deleted"

  // productos
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "product_viewed"
  | "products_imported"

  // categorías
  | "category_created"
  | "category_updated"
  | "category_deleted"

  // suscripción
  | "subscription_started"
  | "subscription_upgraded"
  | "subscription_cancelled"
  | "trial_started"
  | "payment_completed"
  | "payment_failed"

  // QR
  | "qr_generated"
  | "qr_downloaded"
  | "qr_shared"

  // navegación
  | "page_view"
  | "dashboard_accessed"
  | "settings_accessed"

  // errores
  | "error_occurred"
  | "api_error"

  // PWA
  | "pwa_installed"
  | "pwa_prompt_shown"

  // Otros eventos personalizados
  | string;

export interface AnalyticsEventParams {
  // Parámetros comunes
  event_category?: string;
  event_label?: string;
  value?: number;

  // Parámetros específicos
  user_id?: string;
  company_id?: string;
  branch_id?: string;
  product_id?: string;
  plan_type?: string;
  error_message?: string;
  page_path?: string;

  // Cualquier otro parámetro personalizado
  [key: string]: any;
}

/**
 * Hook para registrar eventos en Google Analytics
 * @returns Función para enviar eventos a GA
 */
export const useAnalyticsEvent = () => {
  const trackEvent = useCallback(
    (eventName: AnalyticsEventName, params?: AnalyticsEventParams) => {
      // Verificar si estamos en producción y si gtag está disponible
      // No hace nada en desarrollo para limpiar consola
      if (import.meta.env.VITE_STAGE !== "prod") {
        return;
      }

      if (typeof window === "undefined" || !window.gtag) {
        console.warn("[GA] gtag no está disponible");
        return;
      }

      try {
        // Enviar evento a Google Analytics
        window.gtag("event", eventName, {
          ...params,
          // Agregar timestamp
          timestamp: new Date().toISOString(),
          // Agregar información del entorno
          environment: import.meta.env.VITE_STAGE,
        });
      } catch (error) {
        console.error("[GA] Error al enviar evento:", error);
      }
    },
    []
  );

  /**
   * Registrar una vista de página
   */
  const trackPageView = useCallback(
    (pagePath: string, pageTitle?: string) => {
      trackEvent("page_view", {
        page_path: pagePath,
        page_title: pageTitle || document.title,
      });
    },
    [trackEvent]
  );

  /**
   * Registrar un error
   */
  const trackError = useCallback(
    (errorMessage: string, errorContext?: string) => {
      trackEvent("error_occurred", {
        event_category: "Error",
        error_message: errorMessage,
        error_context: errorContext,
      });
    },
    [trackEvent]
  );

  /**
   * Registrar una conversión (suscripción, pago, etc.)
   */
  const trackConversion = useCallback(
    (conversionType: string, value?: number, currency: string = "USD") => {
      trackEvent("conversion", {
        event_category: "Conversion",
        event_label: conversionType,
        value,
        currency,
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPageView,
    trackError,
    trackConversion,
  };
};
