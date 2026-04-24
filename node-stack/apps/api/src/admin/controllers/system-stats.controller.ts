import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AdminOnly } from "../../common/decorators/admin.decorator.js";
import { AnalyticsRepository } from "@node-stack/db";

@ApiTags("admin-stats")
@Controller("admin/stats")
@AdminOnly()
export class SystemStatsController {
  constructor(private analyticsRepository: AnalyticsRepository) {}

  @Get("overview")
  @ApiOperation({ summary: "Get system-wide overview stats (Admin only)" })
  @ApiResponse({ status: 200, description: "Stats retrieved" })
  async getOverview() {
    // This would gather aggregate data across the system
    const userCount = await this.analyticsRepository.getUserCount();
    const activeSessions = await this.analyticsRepository.getActiveSessionsCount();
    
    return {
      users: {
        total: userCount,
        active: activeSessions,
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
      status: "healthy",
    };
  }
}
