import { Module, Global } from "@nestjs/common";
import { FeatureFlagService } from "@node-stack/config";
import { AuditService } from "./services/audit.service";
import { IdempotencyService } from "./services/idempotency.service";
import { IdempotencyGuard } from "./guards/idempotency.guard";
import { IdempotencyInterceptor } from "./interceptors/idempotency.interceptor";
import { OutboxService } from "./services/outbox.service";
import { QueueModule } from "./queues/queue.module";
import { JobsController } from "./controllers/jobs.controller";

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
  ],
  exports: [
    QueueModule,
    FeatureFlagService, 
    AuditService, 
    IdempotencyService, 
    IdempotencyGuard, 
    IdempotencyInterceptor,
    OutboxService,
  ],
})
export class CommonModule {}
