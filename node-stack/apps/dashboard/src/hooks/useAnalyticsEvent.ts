import { useCallback } from "react";

export type AnalyticsEventName =
  // autenticación
  | "login"
  | "logout"
  | "sign_up"
  | "password_reset"
  | "email_verified"

  // organización/workspace
  | "organization_created"
  | "organization_updated"
  | "workspace_created"
  | "workspace_updated"
  | "workspace_deleted"

  // recursos
  | "resource_created"
  | "resource_updated"
  | "resource_deleted"
  | "resource_viewed"
  | "data_imported"

  // suscripción
  | "subscription_started"
  | "subscription_upgraded"
  | "subscription_cancelled"
  | "trial_started"
  | "payment_completed"
  | "payment_failed"

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
  organization_id?: string;
  workspace_id?: string;
  resource_id?: string;
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
      if (import.meta.env.VITE_STAGE !== "prod") {
        return;
      }

      if (typeof window === "undefined" || !(window as any).gtag) {
        console.warn("[GA] gtag no está disponible");
        return;
      }

      try {
        // Enviar evento a Google Analytics
        (window as any).gtag("event", eventName, {
          ...params,
          timestamp: new Date().toISOString(),
          environment: import.meta.env.VITE_STAGE,
        });
      } catch (error) {
        console.error("[GA] Error al enviar evento:", error);
      }
    },
    []
  );

  const trackPageView = useCallback(
    (pagePath: string, pageTitle?: string) => {
      trackEvent("page_view", {
        page_path: pagePath,
        page_title: pageTitle || document.title,
      });
    },
    [trackEvent]
  );

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
