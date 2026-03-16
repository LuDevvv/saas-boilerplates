import { client } from "../lib/api";
import type { IDashboardMetrics } from "../types";

/**
 * Service to handle metrics-related API interactions.
 */
export const MetricsService = {
  /**
   * Fetches real-time dashboard metrics.
   * @returns Promise with dashboard metrics data.
   */
  async getDashboardMetrics(): Promise<IDashboardMetrics | null> {
    try {
      const res = await client.api.metrics.dashboard.$get();
      if (!res.ok) throw new Error("Failed to fetch dashboard metrics");

      const result = (await res.json()) as {
        success: boolean;
        data: IDashboardMetrics;
      };
      return result.data;
    } catch (error) {
      console.error("[MetricsService] getDashboardMetrics error:", error);
      throw error;
    }
  },
};
