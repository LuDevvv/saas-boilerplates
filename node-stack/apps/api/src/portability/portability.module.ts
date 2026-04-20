import { Module } from "@nestjs/common";
import { PortabilityController } from "./portability.controller";
import { PortabilityService } from "./portability.service";
import { PortabilityExporter } from "@node-stack/services";
import { QueueModule } from "../common/queues/queue.module";

@Module({
  imports: [QueueModule],
  controllers: [PortabilityController],
  providers: [PortabilityService, PortabilityExporter],
  exports: [PortabilityService, PortabilityExporter],
})
export class PortabilityModule {}
