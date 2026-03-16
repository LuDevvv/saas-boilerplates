import type { KVNamespace } from "@cloudflare/workers-types";
import type { QueueService } from "./queue.service";

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

  return {
    /**
     * Checks if a workspace has enough quota remaining for a specific metric.
     *
     * @param workspaceId - Target workspace
     * @param metric - Metric identifier (e.g. 'ai_tokens')
     * @param amount - Amount to consume
     * @returns {Promise<boolean>} True if within limit
     */
    async checkLimit(
      workspaceId: string,
      metric: string,
      amount: number,
    ): Promise<boolean> {
      const key = getKey(workspaceId, metric);
      const state = await kv.get<UsageState>(key, "json");

      // If no state exists, we assume no usage yet.
      // In a production app, you might want to fetch default limits from a config or DB here.
      if (!state) return true;

      // Check if quota has expired/reset
      if (Date.now() > state.resetAt) {
        // Return true but don't reset KV yet, incrementUsage will handle it
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
     */
    async incrementUsage(
      workspaceId: string,
      metric: string,
      amount: number,
    ): Promise<void> {
      const key = getKey(workspaceId, metric);
      const state = await kv.get<UsageState>(key, "json");

      let newState: UsageState;

      if (!state || Date.now() > state.resetAt) {
        // Initialize or Reset (Assuming monthly reset as default if missing)
        // In real world, fetch these from DB/Subscription mapping
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        newState = {
          current: amount,
          limit: state?.limit ?? 1000, // Default fallback
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
