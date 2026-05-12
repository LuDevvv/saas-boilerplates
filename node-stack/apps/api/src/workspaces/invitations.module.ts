import { Module } from "@nestjs/common";
import { DatabaseModule } from "@node-stack/db";

import { BillingModule } from "@/billing/billing.module.js";
import { OutboxService } from "@/common/services/outbox.service.js";
import { InvitationsController } from "@/workspaces/invitations.controller.js";
import { InvitationsService } from "@/workspaces/invitations.service.js";


@Module({
  imports: [DatabaseModule, BillingModule],
  providers: [
    InvitationsService,
    OutboxService,
  ],
  controllers: [InvitationsController],
  exports: [InvitationsService],
})
export class InvitationsModule {}
