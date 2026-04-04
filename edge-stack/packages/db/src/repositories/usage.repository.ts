import { eq, and } from "drizzle-orm";
import type { Database } from "../db";
import {
  usageMetrics,
  type UsageMetric,
  type NewUsageMetric,
} from "../schema/usage";

/**
 * Repository for persisting and retrieving usage quotas and metrics.
 */
export const UsageRepository = {
  /**
   * Upserts a usage metric record.
   * Updates the current usage count and reset timestamp.
   */
  async upsertUsage(db: Database, data: NewUsageMetric): Promise<UsageMetric> {
    const [result] = await db
      .insert(usageMetrics)
      .values(data)
      .onConflictDoUpdate({
        target: [usageMetrics.workspaceId, usageMetrics.metricName],
        set: {
          currentUsage: data.currentUsage,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!result) throw new Error("Failed to upsert usage metric");
    return result;
  },

  /**
   * Retrieves a specific metric for a workspace.
   */
  async getMetric(
    db: Database,
    workspaceId: string,
    metricName: string,
  ): Promise<UsageMetric | null> {
    const result = await db
      .select()
      .from(usageMetrics)
      .where(
        and(
          eq(usageMetrics.workspaceId, workspaceId),
          eq(usageMetrics.metricName, metricName),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  },
};
