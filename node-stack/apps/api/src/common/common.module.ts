import { Module, Global } from "@nestjs/common";
import { FeatureFlagService } from "@node-stack/config";
import { AuditService } from "./services/audit.service.js";
import { IdempotencyService } from "./services/idempotency.service.js";
import { IdempotencyGuard } from "./guards/idempotency.guard.js";
import { IdempotencyInterceptor } from "./interceptors/idempotency.interceptor.js";
import { OutboxService } from "./services/outbox.service.js";
import { QueueModule } from "./queues/queue.module.js";
import { JobsController } from "./controllers/jobs.controller.js";
import { EncryptionService } from "./services/encryption.service.js";

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
    IdempotencyGuard,
    IdempotencyInterceptor,
    OutboxService,
    EncryptionService,
  ],
  exports: [
    QueueModule,
    FeatureFlagService, 
    AuditService, 
    IdempotencyService, 
    IdempotencyGuard, 
    IdempotencyInterceptor,
    OutboxService,
    EncryptionService,
  ],
})
export class CommonModule {}
