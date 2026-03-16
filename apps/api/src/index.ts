import * as Sentry from "@sentry/cloudflare";
import app from "./app";
import { authRouter } from "./modules/auth/auth.routes";
import { storageRouter } from "./modules/storage/storage.routes";
import { billingRouter } from "./modules/billing/billing.routes";
import { workspaceRouter } from "./modules/workspaces/workspace.routes";
import { userRouter } from "./modules/users/user.routes";
import { tasksRouter } from "./modules/tasks/tasks.routes";
import { metricsRouter } from "./modules/metrics/metrics.routes";
import { queueHandler } from "./queue/handler";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Bindings } from "./common/types/env";
import type { QueueMessage } from "@workspace/types";
import type { ExportedHandler } from "@cloudflare/workers-types";

/**
 * Global entry point for the API and Background Tasks.
 * Optimized for Cloudflare Workers Edge runtime.
 */

// Chain explicitly onto a pristine router to preserve proper RPC inference across boundaries
// without accumulating parameter pollution from app.use("*") wildcard middlewares.
const rpcBase = new OpenAPIHono();
const routes = rpcBase
  .route("/api/auth", authRouter)
  .route("/api/storage", storageRouter)
  .route("/api/billing", billingRouter)
  .route("/api/workspaces", workspaceRouter)
  .route("/api/users", userRouter)
  .route("/api/tasks", tasksRouter)
  .route("/api/metrics", metricsRouter);

// Attach the clean route tree to the main app instance which has the middlewares
app.route("/", routes);

export type AppType = typeof routes;

/**
 * Global entry point for the Cloudflare Worker.
 * Wrapped with Sentry for automatic error tracking, performance monitoring, and tracing.
 *
 * Note: Use 'as any' for the handler metadata to bypass complex structural type conflicts
 * between the various versions of '@cloudflare/workers-types' in the monorepo.
 */
export default Sentry.withSentry(
  (env: Bindings) => ({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV || "production",
    tracesSampleRate: Number(env.SENTRY_TRACES_SAMPLE_RATE) || 1.0,
    enableLogs: env.SENTRY_ENABLE_LOGS ?? true,
    sendDefaultPii: env.SENTRY_SEND_DEFAULT_PII ?? true,
  }),
  {
    fetch: app.fetch,
    queue: queueHandler,
  } as any,
);
