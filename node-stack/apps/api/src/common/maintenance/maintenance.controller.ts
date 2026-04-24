/**
 * Maintenance Controller
 * 
 * HTTP endpoints for manual maintenance operations.
 * Methods map directly to the cron-based MaintenanceService.
 */

import { Controller, Post } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { MaintenanceService } from "./maintenance.service.js";

@ApiTags("maintenance")
@Controller("maintenance")
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post("cleanup/outbox")
  @ApiOperation({ summary: "Manually trigger outbox cleanup" })
  @ApiResponse({ status: 200, description: "Outbox cleanup executed" })
  async cleanupOutbox() {
    await this.maintenanceService.cleanupOutbox();
    return { success: true, message: "Outbox cleanup executed" };
  }

  @Post("cleanup/uploads")
  @ApiOperation({ summary: "Manually trigger abandoned uploads cleanup" })
  @ApiResponse({ status: 200, description: "Abandoned uploads cleanup executed" })
  async cleanupUploads() {
    await this.maintenanceService.cleanupAbandonedUploads();
    return { success: true, message: "Abandoned uploads cleanup executed" };
  }

  @Post("cleanup/sessions")
  @ApiOperation({ summary: "Manually trigger session purge" })
  @ApiResponse({ status: 200, description: "Session purge executed" })
  async purgeSessions() {
    await this.maintenanceService.purgeExpiredSessions();
    return { success: true, message: "Session purge executed" };
  }

  @Post("run")
  @ApiOperation({ summary: "Run full maintenance (all cleanup tasks)" })
  @ApiResponse({ status: 200, description: "Full maintenance completed" })
  async runFullMaintenance() {
    await Promise.all([
      this.maintenanceService.cleanupOutbox(),
      this.maintenanceService.cleanupAbandonedUploads(),
      this.maintenanceService.purgeExpiredSessions(),
    ]);
    return { success: true, message: "Full maintenance cycle completed" };
  }
}