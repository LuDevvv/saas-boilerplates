import { eq, count, sql } from "drizzle-orm";
import type { Database } from "../db";
import { memberships } from "../schema/workspaces";
import { tasks } from "../schema/tasks";
import { usageMetrics } from "../schema/usage";
import { subscriptions } from "../schema/billing";

/**
 * Aggregated dashboard metrics shape.
 */
export interface DashboardMetrics {
  teamMembers: number;
  totalTasks: number;
  subscriptionStatus: string | null;
  usage: {
    metricName: string;
    currentUsage: number;
    quotaLimit: number;
  }[];
}

/**
 * Repository for aggregating workspace-scoped dashboard metrics.
 * All queries are lean and indexed for sub-50ms edge performance.
 */
export const MetricsRepository = {
  /**
   * Aggregates all dashboard-relevant metrics for a workspace in parallel.
   * Uses separate indexed queries instead of expensive JOINs.
   */
  async getDashboardMetrics(
    db: Database,
    workspaceId: string,
  ): Promise<DashboardMetrics> {
    const [membersResult, tasksResult, usageResult, subResult] =
      await Promise.all([
        // COUNT team members
        db
          .select({ count: count() })
          .from(memberships)
          .where(eq(memberships.workspaceId, workspaceId)),

        // COUNT tasks
        db
          .select({ count: count() })
          .from(tasks)
          .where(eq(tasks.workspaceId, workspaceId)),

        // All usage metrics for this workspace
        db
          .select({
            metricName: usageMetrics.metricName,
            currentUsage: usageMetrics.currentUsage,
            quotaLimit: usageMetrics.quotaLimit,
          })
          .from(usageMetrics)
          .where(eq(usageMetrics.workspaceId, workspaceId)),

        // Current subscription status
        db
          .select({ status: subscriptions.status })
          .from(subscriptions)
          .where(eq(subscriptions.workspaceId, workspaceId))
          .limit(1),
      ]);

    return {
      teamMembers: membersResult[0]?.count ?? 0,
      totalTasks: tasksResult[0]?.count ?? 0,
      subscriptionStatus: subResult[0]?.status ?? null,
      usage: usageResult.map((u: any) => ({
        metricName: u.metricName,
        currentUsage: u.currentUsage,
        quotaLimit: u.quotaLimit,
      })),
    };
  },
};
