import { Module } from "@nestjs/common";
import { 
  InvitationRepository, 
  WorkspaceRepository, 
  UserRepository 
} from "@node-stack/db";

import { InvitationsController } from "./invitations.controller.js";
import { InvitationsService } from "./invitations.service.js";
import { OutboxService } from "../common/services/outbox.service.js";

import { DatabaseModule } from "@node-stack/db";

@Module({
  imports: [DatabaseModule],
  providers: [
    InvitationsService,
    OutboxService,
  ],
  controllers: [InvitationsController],
  exports: [InvitationsService],
})
export class InvitationsModule {}
