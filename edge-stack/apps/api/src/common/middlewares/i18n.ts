import type { Context, Next } from "hono";
import type { AppContext } from "../types/env";

/**
 * Middleware to detect the preferred language from the 'Accept-Language' header.
 * Defaults to 'en' if no matching locale is found.
 */
export const i18nMiddleware = async (
  c: Context<AppContext>,
  next: Next,
): Promise<void> => {
  const acceptLanguage = c.req.header("Accept-Language");

  // Simple parser for standard browser locale headers (e.g., 'es-ES,es;q=0.9,en;q=0.8')
  let detectedLocale = "en";

  if (acceptLanguage) {
    if (acceptLanguage.includes("es")) {
      detectedLocale = "es";
    }
  }

  // Set locale in context for downstream error handlers and services
  c.set("lang" as any, detectedLocale);

  await next();
};
