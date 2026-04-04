import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { AppContext } from "../../common/types/env";
import { createDbClient, sql } from "@workspace/db";

const app = new OpenAPIHono<AppContext>();

const healthSchema = z.object({
  status: z.string().openapi({ example: "ok" }),
  timestamp: z.string().openapi({ example: "2024-03-20T12:00:00Z" }),
  environment: z.string().openapi({ example: "production" }),
});

const deepHealthSchema = z.object({
  status: z.string().openapi({ example: "ok" }),
  checks: z.object({
    database: z.object({
      status: z.string().openapi({ example: "ok" }),
      latencyMs: z.number().optional(),
    }),
    cache: z.object({
      status: z.string().openapi({ example: "ok" }),
    }),
  }),
});

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: ["System"],
  summary: "Liveness probe",
  description: "Check if the API process is alive and responding.",
  responses: {
    200: {
      description: "API is alive",
      content: {
        "application/json": { schema: healthSchema },
      },
    },
  },
});

const deepHealthRoute = createRoute({
  method: "get",
  path: "/health/deep",
  tags: ["System"],
  summary: "Readiness probe",
  description: "Verify connectivity to downstream dependencies (DB, KV).",
  responses: {
    200: {
      description: "All systems operational",
      content: {
        "application/json": { schema: deepHealthSchema },
      },
    },
    503: {
      description: "System degraded",
      content: {
        "application/json": { schema: deepHealthSchema },
      },
    },
  },
});

app.openapi(healthRoute, (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: c.env.NODE_ENV || "development",
  });
});

app.openapi(deepHealthRoute, async (c) => {
  const { db, cache } = c.var.services || {};
  const checks = {
    database: { status: "pending", latencyMs: 0 },
    cache: { status: "pending" },
  };

  let hasError = false;

  // 1. Database Check
  try {
    if (db) {
      const start = Date.now();
      await db.execute(sql`SELECT 1`);
      checks.database.status = "ok";
      checks.database.latencyMs = Date.now() - start;
    } else {
      checks.database.status = "missing_injection";
      hasError = true;
    }
  } catch (err) {
    console.error(`[HealthCheck] Database failure:`, err);
    checks.database.status = "error";
    hasError = true;
  }

  // 2. Cache Check (KV)
  try {
    if (cache) {
      await cache.get("__health_check__");
      checks.cache.status = "ok";
    } else {
      checks.cache.status = "missing_injection";
      hasError = true;
    }
  } catch (err) {
    console.error(`[HealthCheck] Cache failure:`, err);
    checks.cache.status = "error";
    hasError = true;
  }

  const response = {
    status: hasError ? "error" : "ok",
    checks,
  };

  return c.json(response, (hasError ? 503 : 200) as any);
});

export { app as systemRouter };
