import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { Role } from "@node-stack/types";

import { AnalyticsService } from "@/analytics/analytics.service.js";
import { Roles } from "@/common/decorators/roles.decorator.js";
import { WorkspaceGuard } from "@/common/guards/workspace.guard.js";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("workspaces/:workspaceId/usage")
  @UseGuards(WorkspaceGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async getWorkspaceUsage(@Param("workspaceId") workspaceId: string) {
    return this.analyticsService.getWorkspaceUsage(workspaceId);
  }

  @Get("workspaces/:workspaceId/overview")
  @UseGuards(WorkspaceGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async getOverview(@Param("workspaceId") workspaceId: string) {
    return this.analyticsService.getOverview(workspaceId);
  }

  @Get("workspaces/:workspaceId/traffic")
  @UseGuards(WorkspaceGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async getTraffic(@Param("workspaceId") workspaceId: string) {
    return this.analyticsService.getTraffic(workspaceId);
  }

  @Get("workspaces/:workspaceId/pages")
  @UseGuards(WorkspaceGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async getPages(@Param("workspaceId") workspaceId: string) {
    return this.analyticsService.getPages(workspaceId);
  }

  @Get("admin/global-stats")
  @Roles(Role.SUPER_ADMIN)
  async getGlobalStats() {
    return this.analyticsService.getGlobalAdminStats();
  }
}
