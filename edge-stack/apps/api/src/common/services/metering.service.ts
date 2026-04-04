import type { KVNamespace } from "@cloudflare/workers-types";
import type { QueueService } from "./queue.service";
import { TIER_CONFIG, type SubscriptionTier } from "../constants/subscriptions";

/**
 * Interface for the usage state stored in KV.
 */
interface UsageState {
  current: number;
  limit: number;
  resetAt: number; // UNIX timestamp
}

/**
 * Service for edge-native usage metering and quota enforcement.
 * Leverages Cloudflare KV for sub-10ms checks and enqueues syncs to Neon.
 */
export const createMeteringService = (
  kv: KVNamespace,
  queueService: QueueService,
) => {
  const getKey = (workspaceId: string, metric: string) =>
    `usage:${workspaceId}:${metric}`;

  const getLimitForPlan = (
    plan: SubscriptionTier | undefined,
    metric: string,
  ): number => {
    const config = TIER_CONFIG[plan || "FREE"];
    switch (metric) {
      case "storage":
        return config.storageLimit;
      case "email":
        return config.emailQuota;
      case "compute":
        return config.computeQuota;
      default:
        return 1000;
    }
  };

  return {
    /**
     * Checks if a workspace has enough quota remaining for a specific metric.
     *
     * @param workspaceId - Target workspace
     * @param metric - Metric identifier (e.g. 'compute')
     * @param amount - Amount to consume
     * @param workspacePlan - Current subscription plan
     * @returns {Promise<boolean>} True if within limit
     */
    async checkLimit(
      workspaceId: string,
      metric: string,
      amount: number,
      workspacePlan?: SubscriptionTier,
    ): Promise<boolean> {
      const key = getKey(workspaceId, metric);
      const state = await kv.get<UsageState>(key, "json");

      if (!state) {
        // Use plan-based default if no state exists
        const limit = getLimitForPlan(workspacePlan, metric);
        return amount <= limit;
      }

      // Check if quota has expired/reset
      if (Date.now() > state.resetAt) {
        return true;
      }

      return state.current + amount <= state.limit;
    },

    /**
     * Increments usage for a metric and triggers a background sync to the database.
     * Handles quota resets if the reset period has passed.
     *
     * @param workspaceId - Target workspace
     * @param metric - Metric identifier
     * @param amount - Amount to increment
     * @param workspacePlan - Current subscription plan
     */
    async incrementUsage(
      workspaceId: string,
      metric: string,
      amount: number,
      workspacePlan?: SubscriptionTier,
    ): Promise<void> {
      const key = getKey(workspaceId, metric);
      const state = await kv.get<UsageState>(key, "json");

      let newState: UsageState;

      if (!state || Date.now() > state.resetAt) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const limit = getLimitForPlan(workspacePlan, metric);

        newState = {
          current: amount,
          limit,
          resetAt: nextMonth.getTime(),
        };
      } else {
        newState = {
          ...state,
          current: state.current + amount,
        };
      }

      // Write back to KV (Edge-fast)
      await kv.put(key, JSON.stringify(newState));

      // Enqueue DB Sync (Background)
      await queueService.enqueueUsageSync({
        workspaceId,
        metricName: metric,
        currentUsage: newState.current,
      });
    },
  };
};
