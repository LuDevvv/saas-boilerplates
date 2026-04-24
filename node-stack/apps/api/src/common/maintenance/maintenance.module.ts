import { Module } from "@nestjs/common";
import { MaintenanceService } from "./maintenance.service.js";
import { StorageModule } from "../../storage/storage.module.js";
import { DatabaseModule } from "@node-stack/db";

@Module({
  imports: [DatabaseModule, StorageModule],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
