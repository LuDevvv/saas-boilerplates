import type { Context, Next, MiddlewareHandler } from "hono";
import type { AppContext } from "../types/env";
import { AppError } from "@workspace/types";
import { createMeteringService } from "../services/metering.service";
import { createQueueService } from "../services/queue.service";
import type { SubscriptionTier } from "../constants/subscriptions";


/**
 * Factory for creating usage enforcement middleware.
 * Verifies if the active workspace has remaining quota for a specific metric.
 *
 * @param metricName - The metric to check (e.g., 'ai_tokens')
 * @param amount - The required amount to consume (default: 1)
 */
export const requireQuota = (
  metricName: string,
  amount: number = 1,
): MiddlewareHandler<AppContext> => {
  return async (c: Context<AppContext>, next: Next): Promise<void> => {
    const workspaceId = c.get("workspaceId");
    const workspacePlan = c.get("workspacePlan") as SubscriptionTier | undefined;

    if (!workspaceId) {
      throw new AppError(
        "Multi-tenant context missing. Ensure workspaceGuard is applied before requireQuota.",
        400,
        "MISSING_WORKSPACE_CONTEXT",
      );
    }

    const queueService = createQueueService(c.env.JOBS_QUEUE);
    const meteringService = createMeteringService(c.env.USAGE_KV, queueService);

    // 1. Fast Edge pre-check
    const hasBalance = await meteringService.checkLimit(
      workspaceId,
      metricName,
      amount,
      workspacePlan,
    );

    if (!hasBalance) {
      throw new AppError(
        `Quota exceeded for ${metricName}. Please upgrade your plan.`,
        403,
        "QUOTA_EXCEEDED",
      );
    }

    // Proceed to handler
    await next();

    // 2. Post-execution increment
    // We only increment if the request was successful
    if (c.res.status < 400) {
      // Background task: update KV and enqueue sync
      c.executionCtx.waitUntil(
        meteringService.incrementUsage(workspaceId, metricName, amount, workspacePlan),
      );
    }
  };
};
