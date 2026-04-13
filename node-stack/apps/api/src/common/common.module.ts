import { Module, Global } from "@nestjs/common";
import { CacheService } from "@node-stack/cache";
import { FeatureFlagService } from "@node-stack/config";
import { AuditService } from "./services/audit.service";
import { IdempotencyService } from "./services/idempotency.service";
import { IdempotencyGuard } from "./guards/idempotency.guard";
import { IdempotencyInterceptor } from "./interceptors/idempotency.interceptor";
import { OutboxService } from "./services/outbox.service";

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
    IdempotencyService,
    IdempotencyGuard,
    IdempotencyInterceptor,
    OutboxService,
  ],
  exports: [
    CacheService, 
    FeatureFlagService, 
    AuditService, 
    IdempotencyService, 
    IdempotencyGuard, 
    IdempotencyInterceptor,
    OutboxService,
  ],
})
export class CommonModule {}
