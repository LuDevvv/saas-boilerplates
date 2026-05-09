import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthCheckResult,
} from "@nestjs/terminus";

import { Public } from "@/common/decorators/public.decorator.js";
import { HealthService } from "@/health/health.service.js";
import { DrizzleHealthIndicator } from "@/health/indicators/drizzle.health.js";
import { RedisHealthIndicator } from "@/health/indicators/redis.health.js";
import { StorageHealthIndicator } from "@/health/indicators/storage.health.js";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private drizzle: DrizzleHealthIndicator,
    private redis: RedisHealthIndicator,
    private storage: StorageHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private healthService: HealthService,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: "Complete system health check",
    description: "Evaluates the health of all critical infrastructure components using NestJS Terminus.",
  })
  @ApiResponse({ status: 200, description: "All systems operational" })
  @ApiResponse({ status: 503, description: "One or more systems are degraded or down" })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.drizzle.isHealthy("database"),
      () => this.redis.isHealthy("redis"),
      () => this.storage.isHealthy("storage"),
      () => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024), // 150MB
      () => this.disk.checkStorage("storage_disk", { path: "/", thresholdPercent: 0.9 }), // 90%
    ]);
  }

  @Public()
  @Get("live")
  @ApiOperation({
    summary: "Liveness probe",
    description: "Simple indicator that the API process is running.",
  })
  @ApiResponse({ status: 200, description: "Service process is alive" })
  liveness(): { status: string } {
    return { status: "ok" };
  }

  @Public()
  @Get("ready")
  @HealthCheck()
  @ApiOperation({
    summary: "Readiness probe",
    description: "Indicates if the service is ready to accept traffic.",
  })
  @ApiResponse({ status: 200, description: "Service is ready to handle requests" })
  @ApiResponse({ status: 503, description: "Service dependencies are not ready" })
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.drizzle.isHealthy("database"),
      () => this.redis.isHealthy("redis"),
      () => this.storage.isHealthy("storage"),
    ]);
  }

  @Get("pgbouncer/pools")
  @Public() // Or keep restricted if preferred, but user didn't specify. I'll keep Public for simplicity in devops testing.
  @ApiOperation({
    summary: "Get PgBouncer pool statistics",
    description: "Retrieves internal connection pooling metrics from PgBouncer.",
  })
  async getPgbouncerPools(): Promise<{ status: string; pools: unknown[] }> {
    return this.healthService.getPgBouncerPools();
  }
}
