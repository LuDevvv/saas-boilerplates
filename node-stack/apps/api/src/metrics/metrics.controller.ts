import { Controller, Get, Header, UnauthorizedException, Req } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

import { MetricsService } from "@/metrics/metrics.service.js";
import { Public } from "@/common/decorators/public.decorator.js";

@Controller("metrics")
export class MetricsController {
  constructor(
    private readonly metrics: MetricsService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get()
  @Header("Content-Type", "text/plain")
  async getMetrics(@Req() req: Request): Promise<string> {
    const authHeader = req.headers.authorization;
    const token = this.config.get<string>("METRICS_TOKEN");

    if (token && authHeader !== `Bearer ${token}`) {
      throw new UnauthorizedException("Invalid metrics token");
    }

    return this.metrics.getMetrics();
  }
}
