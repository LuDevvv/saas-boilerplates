import { Module } from "@nestjs/common";
import { UsersAdminController } from "./controllers/users-admin.controller";
import { ConfigAdminController } from "./controllers/config-admin.controller";
import { SystemStatsController } from "./controllers/system-stats.controller";
import { FeatureFlagsAdminController } from "./feature-flags.controller";
import { ImpersonationService } from "./services/impersonation.service";
import { DynamicConfigService } from "./services/dynamic-config.service";
import { AuthModule } from "../auth/auth.module";
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
