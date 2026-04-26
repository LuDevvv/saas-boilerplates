import { Module } from "@nestjs/common";

import { MetricsController } from "@/metrics/metrics.controller.js";
import { MetricsInterceptor } from "@/metrics/metrics.interceptor.js";
import { MetricsService } from "@/metrics/metrics.service.js";

@Module({
  controllers: [MetricsController],
  providers: [MetricsService, MetricsInterceptor],
  exports: [MetricsService, MetricsInterceptor],
})
export class MetricsModule {}
