import { Module } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service.js";

import { UsageQuotaService } from "./usage-quota.service.js";
import { AnalyticsController } from "./analytics.controller.js";
import { DatabaseModule } from "@node-stack/db";
import { BillingModule } from "../billing/billing.module.js";

@Module({
  imports: [DatabaseModule, BillingModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, UsageQuotaService],
  exports: [AnalyticsService, UsageQuotaService],
})
export class AnalyticsModule {}
