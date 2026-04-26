import { Module } from "@nestjs/common";
import { DatabaseModule } from "@node-stack/db";

import { AnalyticsController } from "@/analytics/analytics.controller.js";
import { AnalyticsService } from "@/analytics/analytics.service.js";
import { UsageQuotaService } from "@/analytics/usage-quota.service.js";
import { BillingModule } from "@/billing/billing.module.js";

@Module({
  imports: [DatabaseModule, BillingModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, UsageQuotaService],
  exports: [AnalyticsService, UsageQuotaService],
})
export class AnalyticsModule {}
