import { Module } from "@nestjs/common";

import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { IdempotencyService } from "../common/services/idempotency.service";
import { OutboxService } from "../common/services/outbox.service";

@Module({
  controllers: [BillingController],
  providers: [BillingService, IdempotencyService, OutboxService],
})
export class BillingModule {}
