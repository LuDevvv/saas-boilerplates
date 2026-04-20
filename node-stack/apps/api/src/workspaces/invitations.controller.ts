import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { Role, Permission } from "@node-stack/types";
import { InviteMemberDto } from "@node-stack/validators";

import { Throttle } from "@nestjs/throttler";

import { InvitationsService } from "./invitations.service";
import { CurrentUser } from "../auth/decorators";
import { Public } from "../common/decorators/public.decorator";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { UserPayload } from "../common/types";

@ApiTags("invitations")
@ApiBearerAuth("JWT-auth")
@Controller()
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post("/workspaces/:id/invitations")
  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.MEMBER_INVITE)
  @ApiOperation({ summary: "Create a workspace invitation" })
  @ApiResponse({ status: 201, description: "Invitation created" })
  async createInvitation(
    @Param("id", ParseUUIDPipe) workspaceId: string,
    @Body() dto: InviteMemberDto,
    @CurrentUser("id") userId: UserPayload["id"],
  ) {
    return this.invitationsService.createInvitation(workspaceId, dto, userId);
  }

  @Get("/workspace-invitations/pending")
  @ApiOperation({ summary: "List pending invitations for current user" })
  @ApiResponse({ status: 200, description: "Pending invitations retrieved" })
  async listPendingInvitations(@CurrentUser("id") userId: UserPayload["id"]) {
    return this.invitationsService.listPendingForUser(userId);
  }

  @Get("/workspaces/:id/invitations")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.MEMBER_INVITE)
  @ApiOperation({ summary: "List workspace invitations" })
  @ApiResponse({ status: 200, description: "Invitations retrieved" })
  async listWorkspaceInvitations(
    @Param("id", ParseUUIDPipe) workspaceId: string,
    @CurrentUser("id") userId: UserPayload["id"],
  ) {
    return this.invitationsService.listForWorkspace(workspaceId, userId);
  }

  @Delete("/workspaces/:id/invitations/:invitationId")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.MEMBER_REMOVE)
  @ApiOperation({ summary: "Cancel a pending invitation" })
  @ApiResponse({ status: 200, description: "Invitation cancelled" })
  async cancelInvitation(
    @Param("id", ParseUUIDPipe) workspaceId: string,
    @Param("invitationId", ParseUUIDPipe) invitationId: string,
    @CurrentUser("id") userId: UserPayload["id"],
  ) {
    await this.invitationsService.cancelInvitation(
      workspaceId,
      invitationId,
      userId,
    );
    return { message: "Invitation cancelled successfully" };
  }

  @Post("/workspace-invitations/:token/accept")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Accept a workspace invitation" })
  @ApiResponse({ status: 200, description: "Invitation accepted" })
  async acceptInvitation(
    @Param("token", ParseUUIDPipe) token: string,
    @CurrentUser("id") userId: UserPayload["id"],
  ) {
    return this.invitationsService.acceptInvitation(token, userId);
  }

  @Get("/workspace-invitations/:token")
  @Public()
  @ApiOperation({ summary: "Get invitation details by token" })
  @ApiResponse({ status: 200, description: "Invitation details retrieved" })
  async getInvitationDetails(@Param("token", ParseUUIDPipe) token: string) {
    return this.invitationsService.getInvitationDetails(token);
  }
}

