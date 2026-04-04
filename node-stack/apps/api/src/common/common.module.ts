import { Module, Global } from "@nestjs/common";
import { CacheService } from "@node-stack/cache";
import { FeatureFlagService } from "@node-stack/config";
import { AuditService } from "./services/audit.service";

@Global()
@Module({
  providers: [
    {
      provide: CacheService,
      useValue: new CacheService("api", 3600), // Default config
    },
    {
      provide: FeatureFlagService,
      useClass: FeatureFlagService,
    },
    AuditService,
  ],
  exports: [CacheService, FeatureFlagService, AuditService],
})
export class CommonModule {}
