import { Injectable } from "@nestjs/common";
import { CacheService } from "@node-stack/cache";
import { AnalyticsRepository } from "@node-stack/db";

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly analyticsRepo: AnalyticsRepository,
    private readonly cache: CacheService,
  ) {}

  /**
   * Gets aggregated usage for a workspace.
   * Cached for 60 seconds to prevent heavy aggregation on every request.
   */
  async getWorkspaceUsage(workspaceId: string) {
    return this.cache.getOrSet(
      `analytics:ws:${workspaceId}:usage`,
      async () => {
        const [aiUsage, storageUsage, activityTrend] = await Promise.all([
          this.analyticsRepo.getAiUsage(workspaceId),
          this.analyticsRepo.getStorageUsage(workspaceId),
          this.analyticsRepo.getActivityTrend(workspaceId),
        ]);

        return {
          ai: {
            tokens: aiUsage.reduce((acc: { input: number; output: number }, curr: any) => ({
              input: acc.input + Number(curr.inputTokens),
              output: acc.output + Number(curr.outputTokens),
            }), { input: 0, output: 0 }),
            history: aiUsage.map((u: any) => ({
              date: u.date,
              input: Number(u.inputTokens),
              output: Number(u.outputTokens),
            })),
          },
          storage: storageUsage,
          activity: {
            trend: activityTrend.map((a: any) => ({
              date: a.date,
              count: Number(a.count),
            })),
          },
        };
      },
      60, // 60s TTL
    );
  }

  /**
   * Global usage stats for admin dashboard.
   * Cached for 5 minutes.
   */
  async getGlobalAdminStats() {
    return this.cache.getOrSet(
      "analytics:global:ai-usage",
      () => this.analyticsRepo.getGlobalAiUsage(),
      300,
    );
  }

  async getOverview(workspaceId: string) {
    // Mock data for now
    return {
      totalVisits: { value: 12430, change: 12, trend: "up" },
      activeSessions: { value: 1204, change: -3, trend: "down" },
      bounceRate: { value: 24.5, change: -2.1, trend: "down" } // bounce rate down is good (positive)
    };
  }

  async getTraffic(workspaceId: string) {
    const trend = await this.analyticsRepo.getActivityTrend(workspaceId, 7);
    if (trend.length > 0) {
      return trend.map((t: any) => ({
        date: t.date,
        count: Number(t.count) * 10 // scale up for demo
      }));
    }
    
    // Mock data if no trend
    return [
      { date: "Day 1", count: 40 },
      { date: "Day 2", count: 60 },
      { date: "Day 3", count: 45 },
      { date: "Day 4", count: 80 },
      { date: "Day 5", count: 55 },
      { date: "Day 6", count: 90 },
      { date: "Day 7", count: 70 }
    ];
  }

  async getPages(workspaceId: string) {
    return [
      { path: "/overview", views: "12,430", growth: "+12%" },
      { path: "/workspaces", views: "8,120", growth: "+8%" },
      { path: "/reports", views: "5,400", growth: "-3%" },
      { path: "/settings", views: "2,100", growth: "+5%" }
    ];
  }
}
