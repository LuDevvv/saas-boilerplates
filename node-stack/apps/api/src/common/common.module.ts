import { Module, Global } from "@nestjs/common";
import { FeatureFlagService } from "@node-stack/config";
import { AuditService } from "./services/audit.service.js";
import { IdempotencyService } from "./services/idempotency.service.js";
import { IdempotencyInterceptor } from "./interceptors/idempotency.interceptor.js";
import { OutboxService } from "./services/outbox.service.js";
import { QueueModule } from "./queues/queue.module.js";
import { JobsController } from "./controllers/jobs.controller.js";
import { EncryptionService } from "./services/encryption.service.js";
import { RequestIdMiddleware } from "./middleware/request-id.middleware.js";
import { ApiVersionMiddleware } from "./middleware/api-version.middleware.js";

@Global()
@Module({
  imports: [QueueModule],
  controllers: [JobsController],
  providers: [
    {
      provide: FeatureFlagService,
      useClass: FeatureFlagService,
    },
    AuditService,
    IdempotencyService,
    IdempotencyInterceptor,
    OutboxService,
    EncryptionService,
    RequestIdMiddleware,
    ApiVersionMiddleware,
  ],
  exports: [
    QueueModule,
    FeatureFlagService, 
    AuditService, 
    IdempotencyService, 
    IdempotencyInterceptor,
    OutboxService,
    EncryptionService,
    RequestIdMiddleware,
    ApiVersionMiddleware,
  ],
})
export class CommonModule {}
