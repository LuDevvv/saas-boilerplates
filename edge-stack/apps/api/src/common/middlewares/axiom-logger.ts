import type { MiddlewareHandler } from "hono";
import type { Bindings, Variables } from "../types/env";

/**
 * Axiom Structured Logger Middleware.
 * Captures request/response metadata and streams it to Axiom via fetch.
 * Designed for Cloudflare Workers (non-blocking).
 */
export const axiomLogger = (): MiddlewareHandler<{
  Bindings: Bindings;
  Variables: Variables;
}> => {
  return async (c, next) => {
    const start = Date.now();
    const { method, path } = c.req;

    // Continue execution
    await next();

    // After response is ready, capture metadata
    const duration = Date.now() - start;
    const status = c.res.status;
    const userId = c.get("userId") || "anonymous";

    // Use c.executionCtx.waitUntil to prevent blocking the response
    c.executionCtx.waitUntil(
      (async () => {
        if (!c.env.AXIOM_TOKEN || !c.env.AXIOM_DATASET) return;

        try {
          await fetch(
            `https://api.axiom.co/v1/datasets/${c.env.AXIOM_DATASET}/ingest`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${c.env.AXIOM_TOKEN}`,
              },
              body: JSON.stringify([
                {
                  _time: new Date().toISOString(),
                  method,
                  path,
                  status,
                  latency: `${duration}ms`,
                  duration_ms: duration,
                  userId,
                  userAgent: c.req.header("user-agent"),
                  requestId: c.req.header("cf-ray"),
                  environment: c.env.NODE_ENV || "production",
                },
              ]),
            },
          );
        } catch (error) {
          // Silently fail logging rather than breaking the application flow
          console.error("Axiom Logging Failure:", error);
        }
      })(),
    );
  };
};
