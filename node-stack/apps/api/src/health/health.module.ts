import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { CacheModule } from "@node-stack/cache";

import { HealthController } from "@/health/health.controller.js";
import { HealthService } from "@/health/health.service.js";
import { DrizzleHealthIndicator } from "@/health/indicators/drizzle.health.js";
import { RedisHealthIndicator } from "@/health/indicators/redis.health.js";
import { StorageHealthIndicator } from "@/health/indicators/storage.health.js";
import { StorageModule } from "@/storage/storage.module.js";

@Module({
  imports: [TerminusModule, CacheModule, StorageModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    DrizzleHealthIndicator,
    RedisHealthIndicator,
    StorageHealthIndicator,
  ],
  exports: [HealthService],
})
export class HealthModule {}
