import { Module, Global } from "@nestjs/common";
import { FeatureFlagService } from "@node-stack/config";
import { DatabaseModule } from "@node-stack/db";

import { JobsController } from "@/common/controllers/jobs.controller.js";
import { IdempotencyInterceptor } from "@/common/interceptors/idempotency.interceptor.js";
import { ApiVersionMiddleware } from "@/common/middleware/api-version.middleware.js";
import { RequestIdMiddleware } from "@/common/middleware/request-id.middleware.js";
import { QueueModule } from "@/common/queues/queue.module.js";
import { AuditService } from "@/common/services/audit.service.js";
import { EncryptionService } from "@/common/services/encryption.service.js";
import { IdempotencyService } from "@/common/services/idempotency.service.js";
import { OutboxService } from "@/common/services/outbox.service.js";

@Global()
@Module({
  imports: [QueueModule, DatabaseModule],
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
