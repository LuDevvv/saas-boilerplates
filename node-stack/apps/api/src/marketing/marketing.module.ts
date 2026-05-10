import { Module } from "@nestjs/common";
import { MarketingRepository } from "@node-stack/db";

import { MarketingController } from "@/marketing/marketing.controller.js";
import { MarketingEventListener } from "@/marketing/marketing.listener.js";
import { MarketingService } from "@/marketing/marketing.service.js";
import { MetaCapiService } from "@/marketing/meta-capi.service.js";
import { WhatsAppService } from "@/marketing/whatsapp.service.js";

@Module({
  controllers: [MarketingController],
  providers: [
    MarketingService,
    MarketingRepository,
    MetaCapiService,
    WhatsAppService,
    MarketingEventListener,
  ],
  exports: [MarketingService, MetaCapiService, WhatsAppService],
})
export class MarketingModule {}
