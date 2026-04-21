import { Module } from "@nestjs/common";
import { WorkspaceRepository } from "@node-stack/db";

import { InvitationsModule } from "./invitations.module.js";
import { WorkspacesController } from "./workspaces.controller.js";
import { WorkspacesService } from "./workspaces.service.js";
import { WebhooksController } from "./webhooks.controller.js";
import { WebhooksService } from "./webhooks.service.js";
import { ApiKeysService } from "../api-keys/api-keys.service.js";
import { IdempotencyService } from "../common/services/idempotency.service.js";
import { OutboxService } from "../common/services/outbox.service.js";

import { DatabaseModule } from "@node-stack/db";

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

