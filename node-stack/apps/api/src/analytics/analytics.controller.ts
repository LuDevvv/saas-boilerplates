import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service.js";
import { WorkspaceGuard } from "../common/guards/workspace.guard.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { Role } from "@node-stack/types";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("workspaces/:workspaceId/usage")
  @UseGuards(WorkspaceGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async getWorkspaceUsage(@Param("workspaceId") workspaceId: string) {
    return this.analyticsService.getWorkspaceUsage(workspaceId);
  }

  @Get("admin/global-stats")
  @Roles(Role.SUPER_ADMIN)
  async getGlobalStats() {
    return this.analyticsService.getGlobalAdminStats();
  }
}
