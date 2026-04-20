import { Controller, Get } from "@nestjs/common";
import { AdminOnly } from "../../common/decorators/admin.decorator";
import { AnalyticsRepository } from "@node-stack/db";

@Controller("admin/stats")
@AdminOnly()
export class SystemStatsController {
  constructor(private analyticsRepository: AnalyticsRepository) {}

  @Get("overview")
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
