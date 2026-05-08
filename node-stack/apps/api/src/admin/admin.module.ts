import { Module } from "@nestjs/common";
import { CacheModule } from "@node-stack/cache";
import { DbModule } from "@node-stack/db";

import { AuditAdminController } from "@/admin/controllers/audit-admin.controller.js";
import { ConfigAdminController } from "@/admin/controllers/config-admin.controller.js";
import { SystemStatsController } from "@/admin/controllers/system-stats.controller.js";
import { UsersAdminController } from "@/admin/controllers/users-admin.controller.js";
import { FeatureFlagsAdminController } from "@/admin/feature-flags.controller.js";
import { DynamicConfigService } from "@/admin/services/dynamic-config.service.js";
import { ImpersonationService } from "@/admin/services/impersonation.service.js";
import { AuthModule } from "@/auth/auth.module.js";


@Module({
  imports: [
    AuthModule,
    DbModule,
    CacheModule,
  ],
  controllers: [
    UsersAdminController,
    AuditAdminController,
    ConfigAdminController,
    SystemStatsController,
    FeatureFlagsAdminController,
  ],
  providers: [
    ImpersonationService,
    DynamicConfigService,
  ],
  exports: [
    DynamicConfigService,
  ],
})
export class AdminModule {}
