import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";
import { DrizzleHealthIndicator } from "./indicators/drizzle.health.js";
import { RedisHealthIndicator } from "./indicators/redis.health.js";
import { StorageHealthIndicator } from "./indicators/storage.health.js";
import { CacheModule } from "@node-stack/cache";
import { StorageModule } from "../storage/storage.module.js";

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
