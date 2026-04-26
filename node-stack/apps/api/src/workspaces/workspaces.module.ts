import { Module } from "@nestjs/common";
import { WorkspaceRepository , DatabaseModule } from "@node-stack/db";

import { ApiKeysService } from "@/api-keys/api-keys.service.js";
import { IdempotencyService } from "@/common/services/idempotency.service.js";
import { OutboxService } from "@/common/services/outbox.service.js";
import { InvitationsModule } from "@/workspaces/invitations.module.js";
import { WebhooksController } from "@/workspaces/webhooks.controller.js";
import { WebhooksService } from "@/workspaces/webhooks.service.js";
import { WorkspacesController } from "@/workspaces/workspaces.controller.js";
import { WorkspacesService } from "@/workspaces/workspaces.service.js";



@Module({
  imports: [
    InvitationsModule, 
    DatabaseModule,
  ],
  controllers: [WorkspacesController, WebhooksController],
  providers: [
    WorkspacesService,
    WebhooksService,
    ApiKeysService,
    OutboxService,
    IdempotencyService,
  ],
  exports: [WorkspacesService, WebhooksService],
})
export class WorkspacesModule {}

