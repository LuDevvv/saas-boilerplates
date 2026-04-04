import type { Context } from "hono";
import { AppError } from "@workspace/types";
import { errorResponse } from "../responses";
import { HTTPException } from "hono/http-exception";
import type { ZodError } from "zod";
import type { AppContext } from "../types/env";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Global error handler for the application.
 * catches and formats different error types into a consistent JSON response.
 *
 * @param err - The thrown error object
 * @param c - Hono context
 * @returns JSON response with standardized error body
 */
import { errorMessages, type ErrorCode } from "../i18n/errors";

/**
 * Global error handler for the application.
 * catches and formats different error types into a consistent JSON response.
 * Uses the c.get('lang') from i18nMiddleware for localization.
 */
export const errorHandler = (err: Error, c: Context<AppContext>) => {
  const lang = c.get("lang") || "en";

  // More robust check for AppError that doesn't rely solely on instanceof
  const isAppError =
    err instanceof AppError || (err as any).errorCode !== undefined;

  if (isAppError) {
    const appErr = err as AppError;
    const errorCode = appErr.errorCode as ErrorCode;
    const localizedMessage = errorMessages[lang][errorCode] || appErr.message;

    return c.json(
      errorResponse(appErr.errorCode, localizedMessage, appErr.details),
      (appErr.statusCode || 500) as ContentfulStatusCode,
    );
  }

  if (err instanceof HTTPException) {
    // Use a better message if available, otherwise default to status text or empty
    const message = err.message || (err as any).statusText || "HTTP Error";

    return c.json(
      errorResponse("HTTP_ERROR", message),
      err.status as ContentfulStatusCode,
    );
  }

  if (
    err.name === "ZodError" ||
    (err as { name?: string }).name === "ZodError"
  ) {
    const zodErr = err as ZodError;
    const msg =
      lang === "es" ? "Datos de solicitud inválidos." : "Invalid request data.";

    return c.json(errorResponse("VALIDATION_ERROR", msg, zodErr.issues), 400);
  }

  console.error("[Unhandled Error Full Details]:", err);

  if (c.get("sentry")) {
    c.get("sentry").captureException(err);
  }

  const internalMsg = errorMessages[lang]["GENERIC_ERROR"];
  const isDev = c.env.NODE_ENV !== "production";

  return c.json(
    errorResponse(
      "INTERNAL_SERVER_ERROR",
      internalMsg,
      isDev ? { stack: err.stack, originalError: err.message } : undefined,
    ),
    500,
  );
};
