import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { AnalyticsRepository } from "@node-stack/db";

import { AdminOnly } from "@/common/decorators/admin.decorator.js";

@ApiTags("admin-stats")
@Controller("admin/stats")
@AdminOnly()
export class SystemStatsController {
  constructor(private analyticsRepository: AnalyticsRepository) {}

  @Get("overview")
  @ApiOperation({ summary: "Rich system-wide overview stats (Admin only)" })
  @ApiResponse({ status: 200, description: "Full control-center stats" })
  async getOverview(): Promise<Record<string, unknown>> {
    // Run independent queries concurrently
    const [
      totalUsers,
      activeSessions,
      dau,
      usersByRole,
      usersByStatus,
      newUsersThisWeek,
      newUsersThisMonth,
      totalWorkspaces,
      newWorkspacesThisMonth,
      workspacesByTier,
      activeSubscriptions,
      subscriptionsByStatus,
      aiTokens30d,
      globalAiByModel,
      globalStorage,
      ticketsByStatus,
      tasksByStatus,
      tasksCompletedThisWeek,
    ] = await Promise.all([
      this.analyticsRepository.getUserCount(),
      this.analyticsRepository.getActiveSessionsCount(),
      this.analyticsRepository.getDauCount(),
      this.analyticsRepository.getUsersByRole(),
      this.analyticsRepository.getUsersByStatus(),
      this.analyticsRepository.getNewUsersCount(7),
      this.analyticsRepository.getNewUsersCount(30),
      this.analyticsRepository.getWorkspaceCount(),
      this.analyticsRepository.getNewWorkspacesCount(30),
      this.analyticsRepository.getWorkspacesByTier(),
      this.analyticsRepository.getActiveSubscriptionsCount(),
      this.analyticsRepository.getSubscriptionsByStatus(),
      this.analyticsRepository.getTotalAiTokens(30),
      this.analyticsRepository.getGlobalAiUsage(),
      this.analyticsRepository.getGlobalStorageUsage(),
      this.analyticsRepository.getTicketsByStatus(),
      this.analyticsRepository.getTasksByStatus(),
      this.analyticsRepository.getTasksCompletedRecently(7),
    ]);

    const mem = process.memoryUsage();

    return {
      users: {
        total: totalUsers,
        activeSessions,
        dau,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        byRole: Object.fromEntries(usersByRole.map((r) => [r.role, r.count])),
        byStatus: Object.fromEntries(usersByStatus.map((r) => [r.status, r.count])),
      },
      workspaces: {
        total: totalWorkspaces,
        newThisMonth: newWorkspacesThisMonth,
        byTier: Object.fromEntries(workspacesByTier.map((r) => [r.tier, r.count])),
      },
      subscriptions: {
        active: activeSubscriptions,
        byStatus: Object.fromEntries(subscriptionsByStatus.map((r) => [r.status, r.count])),
      },
      ai: {
        totalTokens30d: aiTokens30d,
        byModel: globalAiByModel,
      },
      storage: globalStorage,
      tickets: {
        byStatus: Object.fromEntries(ticketsByStatus.map((r) => [r.status, r.count])),
        total: ticketsByStatus.reduce((s, r) => s + r.count, 0),
      },
      tasks: {
        byStatus: Object.fromEntries(tasksByStatus.map((r) => [r.status, r.count])),
        completedThisWeek: tasksCompletedThisWeek,
        total: tasksByStatus.reduce((s, r) => s + r.count, 0),
      },
      system: {
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        memoryTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        nodeVersion: process.version,
        status: "healthy" as const,
      },
    };
  }

  @Get("trends")
  @ApiOperation({ summary: "30-day trend data for charts (Admin only)" })
  @ApiQuery({ name: "days", required: false, type: Number, description: "Default 30" })
  @ApiResponse({ status: 200, description: "Trend series data" })
  async getTrends(@Query("days") days = 30): Promise<Record<string, unknown>> {
    const d = Math.min(Number(days) || 30, 90);

    const [userGrowth, activityTrend, aiTrend] = await Promise.all([
      this.analyticsRepository.getUserGrowthTrend(d),
      this.analyticsRepository.getGlobalActivityTrend(d),
      this.analyticsRepository.getGlobalAiTrend(d),
    ]);

    return { userGrowth, activityTrend, aiTrend, days: d };
  }
}
