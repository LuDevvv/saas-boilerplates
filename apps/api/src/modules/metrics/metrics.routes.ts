import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {
  dashboardMetricsResponseSchema,
  ErrorSchema,
} from "@workspace/validators";
import { MetricsController } from "./metrics.controller";
import { authGuard } from "../../common/middlewares/authGuard";
import { workspaceGuard } from "../../common/middlewares/workspaceGuard";
import { rateLimit } from "../../common/middlewares/rateLimiter";
import type { AppContext } from "../../common/types/env";

const app = new OpenAPIHono<AppContext>();

const dashboardMetricsRoute = createRoute({
  method: "get",
  path: "/dashboard",
  tags: ["Metrics"],
  summary: "Get dashboard metrics",
  description:
    "Returns aggregated workspace metrics for the dashboard summary cards.",
  middleware: [
    rateLimit({ window: 60, limit: 30, keyPrefix: "metrics" }),
    authGuard,
    workspaceGuard,
  ] as const,
  responses: {
    200: {
      description: "Metrics retrieved successfully",
      content: {
        "application/json": { schema: dashboardMetricsResponseSchema },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

export const metricsRouter = app.openapi(dashboardMetricsRoute, (c) =>
  MetricsController.getDashboardMetrics(c),
);
