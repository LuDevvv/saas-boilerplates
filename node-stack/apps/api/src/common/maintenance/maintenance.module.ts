import { Module } from "@nestjs/common";
import { DatabaseModule } from "@node-stack/db";

import { MaintenanceService } from "@/common/maintenance/maintenance.service.js";
import { StorageModule } from "@/storage/storage.module.js";

@Module({
  imports: [DatabaseModule, StorageModule],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
