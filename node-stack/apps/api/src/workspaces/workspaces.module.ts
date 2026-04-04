import { Module } from "@nestjs/common";
import { CacheService } from "@node-stack/cache";
import { WorkspaceRepository } from "@node-stack/db";
import { BullModule } from "@nestjs/bullmq";

import { InvitationsModule } from "./invitations.module";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesService } from "./workspaces.service";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";
import { ApiKeysService } from "../api-keys/api-keys.service";
import { IdempotencyService } from "../common/services/idempotency.service";
import { OutboxService } from "../common/services/outbox.service";

import { DatabaseModule } from "../common/database/database.module";

@Module({
  imports: [
    InvitationsModule, 
    DatabaseModule,
    BullModule.registerQueue({
      name: "webhooks.delivery",
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
  ],
  controllers: [WorkspacesController, WebhooksController],
  providers: [
    WorkspacesService,
    WebhooksService,
    ApiKeysService,
    OutboxService,
    IdempotencyService,
    CacheService,
  ],
  exports: [WorkspacesService, WebhooksService],
})
export class WorkspacesModule {}
