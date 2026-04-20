import { Injectable } from "@nestjs/common";
import { AnalyticsRepository } from "@node-stack/db";
import { CacheService } from "@node-stack/cache";

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
}
