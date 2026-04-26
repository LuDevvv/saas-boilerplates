import { Module } from "@nestjs/common";
import { MarketingRepository } from "@node-stack/db";

import { MarketingController } from "@/marketing/marketing.controller.js";
import { MarketingService } from "@/marketing/marketing.service.js";

@Module({
  controllers: [MarketingController],
  providers: [MarketingService, MarketingRepository],
  exports: [MarketingService],
})
export class MarketingModule {}
