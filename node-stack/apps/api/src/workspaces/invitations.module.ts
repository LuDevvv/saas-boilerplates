import { Module } from "@nestjs/common";
import { 
  InvitationRepository, 
  WorkspaceRepository, 
  UserRepository 
} from "@node-stack/db";

import { InvitationsController } from "./invitations.controller";
import { InvitationsService } from "./invitations.service";
import { OutboxService } from "../common/services/outbox.service";

import { DatabaseModule } from "../common/database/database.module";

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
