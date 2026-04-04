import type { Context } from "hono";
import type { AppContext } from "../../common/types/env";
import { AppError } from "@workspace/types";
import { successResponse } from "../../common/responses";
import { createDbClient, MetricsRepository } from "@workspace/db";

/**
 * Controller for aggregating workspace-scoped dashboard metrics.
 * Remains thin — delegates entirely to the MetricsRepository.
 */
export const MetricsController = {
  /**
   * Returns aggregated dashboard metrics for the active workspace.
   * @param c - Hono context with authenticated user and workspace
   */
  async getDashboardMetrics(c: Context<AppContext>) {
    const workspaceId = c.get("workspaceId");

    if (!workspaceId) {
      throw new AppError("Workspace context required.", 400, "BAD_REQUEST");
    }

    const db = createDbClient(c.env.DATABASE_URL);
    const metrics = await MetricsRepository.getDashboardMetrics(
      db,
      workspaceId,
    );

    return c.json(successResponse(metrics), 200);
  },
};
