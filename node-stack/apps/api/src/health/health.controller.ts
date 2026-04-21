import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { HealthService, HealthStatus } from "./health.service.js";
import { JwtAuthGuard } from "../auth/guards/jwt.guard.js";
import { Public } from "../common/decorators/public.decorator.js";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ 
    summary: "Complete system health check",
    description: "Evaluates the health of all critical infrastructure components: Database, Redis, S3, and API services."
  })
  @ApiResponse({ status: 200, description: "All systems operational" })
  @ApiResponse({ status: 503, description: "One or more systems are degraded or down" })
  async check(): Promise<HealthStatus> {
    return this.healthService.check();
  }

  @Public()
  @Get("live")
  @ApiOperation({ 
    summary: "Liveness probe",
    description: "Simple indicator that the API process is running. Used by Kubernetes/Railway for service monitoring."
  })
  @ApiResponse({ status: 200, description: "Service process is alive" })
  liveness(): { status: string } {
    return { status: "ok" };
  }

  @Public()
  @Get("ready")
  @ApiOperation({ 
    summary: "Readiness probe",
    description: "Indicates if the service is ready to accept traffic. Specifically checks database connectivity."
  })
  @ApiResponse({ status: 200, description: "Service is ready to handle requests" })
  @ApiResponse({ status: 503, description: "Database connection failed" })
  async readiness(): Promise<{ status: string }> {
    const dbHealth = await this.healthService.checkDatabase();
    if (dbHealth.status !== "up") {
      throw new HttpException(
        { status: "not_ready", reason: "database unreachable" },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return { status: "ok" };
  }

  @Get("pgbouncer/pools")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ 
    summary: "Get PgBouncer pool statistics",
    description: "Retrieves internal connection pooling metrics from PgBouncer. Requires authentication."
  })
  @ApiResponse({ status: 200, description: "Connection pool metrics retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getPgbouncerPools() {
    return this.healthService.getPgBouncerPools();
  }
}
