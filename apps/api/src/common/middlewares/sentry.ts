import { sentry as honoSentry } from "@hono/sentry";
import * as Sentry from "@sentry/cloudflare";
import type { Context, MiddlewareHandler } from "hono";
import type { AppContext } from "../types/env";

/**
 * Creates a Sentry middleware for Hono.
 * Note: The application is also wrapped with Sentry.withSentry in index.ts for global coverage.
 */
export const createSentryMiddleware = (): MiddlewareHandler => {
  return async (c: Context<AppContext>, next: () => Promise<void>) => {
    const sentryDsn = c.env?.SENTRY_DSN;

    if (!sentryDsn) {
      await next();
      return;
    }

    // Attach Hono-specific context to Sentry
    const sentryMiddleware = honoSentry({
      dsn: sentryDsn,
      tracesSampleRate: Number(c.env.SENTRY_TRACES_SAMPLE_RATE) || 1.0,
      environment: c.env.SENTRY_ENVIRONMENT || c.env.NODE_ENV || "development",
    });

    await sentryMiddleware(c, next);
  };
};

/**
 * Manually capture an exception with additional context.
 * Uses the @sentry/cloudflare SDK.
 */
export const captureException = (
  c: Context<AppContext>,
  error: Error,
  context?: Record<string, unknown>,
) => {
  if (c.env?.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        userId: c.get("userId"),
        workspaceId: c.get("workspaceId"),
        path: c.req.path,
        method: c.req.method,
      },
    });
  } else {
    // Fallback to console during development if DSN is missing
    console.error(`[Sentry Fallback] ${error.message}`, { error, context });
  }
};
