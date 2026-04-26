import { Module } from "@nestjs/common";
import { PortabilityExporter } from "@node-stack/services";

import { QueueModule } from "@/common/queues/queue.module.js";
import { PortabilityController } from "@/portability/portability.controller.js";
import { PortabilityService } from "@/portability/portability.service.js";
import { StorageModule } from "@/storage/storage.module.js";

@Module({
  imports: [QueueModule, StorageModule],
  controllers: [PortabilityController],
  providers: [PortabilityService, PortabilityExporter],
  exports: [PortabilityService, PortabilityExporter],
})
export class PortabilityModule { }