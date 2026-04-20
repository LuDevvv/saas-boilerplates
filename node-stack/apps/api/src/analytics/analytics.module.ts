import { Module } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";

import { UsageQuotaService } from "./usage-quota.service";
import { AnalyticsController } from "./analytics.controller";
import { DatabaseModule } from "../common/database/database.module";
import { BillingModule } from "../billing/billing.module";

@Module({
  imports: [DatabaseModule, BillingModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, UsageQuotaService],
  exports: [AnalyticsService, UsageQuotaService],
})
export class AnalyticsModule {}
