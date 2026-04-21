import { Module } from "@nestjs/common";
import { PortabilityController } from "./portability.controller.js";
import { PortabilityService } from "./portability.service.js";
import { PortabilityExporter } from "@node-stack/services";
import { QueueModule } from "../common/queues/queue.module.js";

import { StorageModule } from "../storage/storage.module.js";

@Module({
  imports: [QueueModule, StorageModule],
  controllers: [PortabilityController],
  providers: [PortabilityService, PortabilityExporter],
  exports: [PortabilityService, PortabilityExporter],
})
export class PortabilityModule { }