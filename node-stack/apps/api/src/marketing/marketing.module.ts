import { Module } from "@nestjs/common";
import { MarketingController } from "./marketing.controller.js";
import { MarketingService } from "./marketing.service.js";
import { MarketingRepository } from "@node-stack/db";

@Module({
  controllers: [MarketingController],
  providers: [MarketingService, MarketingRepository],
  exports: [MarketingService],
})
export class MarketingModule {}
