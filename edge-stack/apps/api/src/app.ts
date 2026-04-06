import { OpenAPIHono } from "@hono/zod-openapi";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { trimTrailingSlash } from "hono/trailing-slash";
// Removed @scalar/hono-api-reference as we are now using a CDN-based HTML template

import { errorHandler } from "./common/middlewares/errorHandler";
import { ipExtractor } from "./common/middlewares/ipExtractor";
import { secureHeaders } from "./common/middlewares/secureHeaders";
import { i18nMiddleware } from "./common/middlewares/i18n";
import { createSentryMiddleware } from "./common/middlewares/sentry";
import { axiomLogger } from "./common/middlewares/axiom-logger";
import { rateLimit } from "./common/middlewares/rateLimiter";
import { corsMiddleware } from "./common/middlewares/cors";
import { idempotencyGuard } from "./common/middlewares/idempotency";
import { injectServices } from "./common/middlewares/injectServices";
import { dbTelemetry } from "./common/middlewares/dbTelemetry";
import { chaosMiddleware } from "./common/middlewares/chaos";

import type { AppContext } from "./common/types/env";

/**
 * Main Application Entry Point.
 * High-performance, multi-tenant API optimized for the Edge.
 */
const app = new OpenAPIHono<AppContext>();

// Essential Middlewares
app.use("*", createSentryMiddleware());

app.use("*", logger());
app.use("*", axiomLogger());
app.use("*", corsMiddleware());
app.use("*", idempotencyGuard);
app.use("*", injectServices());
app.use("*", dbTelemetry());
app.use("*", chaosMiddleware());

// Conditional CSRF Middleware
app.use("*", async (c, next) => {
  const isProd = c.env.NODE_ENV === "production";
  const skipHeader = c.req.header("X-Skip-CSRF") === "true";

  // In development or if explicit skip header is present, bypass CSRF checks
  if (!isProd || skipHeader) {
    return await next();
  }

  // Otherwise, apply Hono's standard CSRF protection
  return csrf({
    origin: (origin, c) => {
      return origin === c.env.PUBLIC_APP_URL;
    },
  })(c, next);
});

app.use("*", trimTrailingSlash());
app.use("*", ipExtractor);
app.use("*", rateLimit({ window: 60, limit: 300, keyPrefix: "firewall" }));
app.use("*", secureHeaders);
app.use("*", i18nMiddleware);

// Global Exception Handler
app.onError(errorHandler);

// OpenAPI Specification Registry
app.doc("/openapi.json", {
  info: {
    title: "Edge API",
    version: "1.0.0",
    description:
      "High-performance, strictly typed API optimized for Cloudflare Workers.",
  },
  openapi: "3.1.0",
});

// Optimized Scalar API Reference using CDN to reduce bundle size
app.get("/docs", (c) => {
  return c.html(`
    <!doctype html>
    <html>
      <head>
        <title>Edge API Reference</title>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1" />
        <style>
          body { margin: 0; }
        </style>
      </head>
      <body>
        <script
          id="api-reference"
          data-url="/openapi.json"></script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
  `);
});

export default app;
