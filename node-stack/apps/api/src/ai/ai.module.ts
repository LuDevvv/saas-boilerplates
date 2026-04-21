import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { CacheModule } from '@node-stack/cache';
import { DatabaseModule } from '@node-stack/db';
import { AnalyticsModule } from '../analytics/analytics.module.js';


/**
 * AI module — no longer registers its own BullMQ queue.
 * All queue configuration is centralized in QueueModule (common/queues).
 * The controller uses JobService instead of injecting Queue directly.
 */
@Module({
  imports: [CacheModule, DatabaseModule, AnalyticsModule],

  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
