import { Module } from "@nestjs/common";
import { UsersAdminController } from "./controllers/users-admin.controller.js";
import { ConfigAdminController } from "./controllers/config-admin.controller.js";
import { SystemStatsController } from "./controllers/system-stats.controller.js";
import { FeatureFlagsAdminController } from "./feature-flags.controller.js";
import { ImpersonationService } from "./services/impersonation.service.js";
import { DynamicConfigService } from "./services/dynamic-config.service.js";
import { AuthModule } from "../auth/auth.module.js";
import { DbModule } from "@node-stack/db";
import { CacheModule } from "@node-stack/cache";

@Module({
  imports: [
    AuthModule,
    DbModule,
    CacheModule,
  ],
  controllers: [
    UsersAdminController,
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
