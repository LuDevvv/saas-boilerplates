import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  BadRequestException,
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

import { InviteDto } from "./dto/invite.dto";
import { InvitationsService } from "./invitations.service";
import { CurrentUser } from "../auth/decorators";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { UserPayload } from "../common/types";


@ApiTags("invitations")
@ApiBearerAuth("JWT-auth")
@Controller()
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  // 1. Create invitation (admin/owner only)
  @Post("/workspaces/:id/invitations")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.MEMBER_INVITE)
  @ApiOperation({ summary: "Create a workspace invitation" })
  @ApiResponse({ status: 201, description: "Invitation created" })
  async createInvitation(
    @Param("id", ParseUUIDPipe) workspaceId: string,
    @Body() body: InviteDto,
    @CurrentUser("id") userId: UserPayload["id"],
  ) {
    return this.invitationsService.createInvitation(workspaceId, body, userId);
  }

  // 2. List pending invitations for current user (any authenticated user)
  @Get("/workspace-invitations/pending")
  @ApiOperation({ summary: "List pending invitations for current user" })
  @ApiResponse({ status: 200, description: "Pending invitations retrieved" })
  async listPendingInvitations(@CurrentUser("id") userId: UserPayload["id"]) {
    return this.invitationsService.listPendingForUser(userId);
  }

  // 3. List workspace invitations (admin/owner)
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

  // 4. Cancel invitation (admin/owner)
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

  // 5. Accept invitation (any authenticated user)
  @Post("/workspace-invitations/:token/accept")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Accept a workspace invitation" })
  @ApiResponse({ status: 200, description: "Invitation accepted" })
  async acceptInvitation(
    @Param("token") token: string,
    @CurrentUser("id") userId: UserPayload["id"],
  ) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        token,
      )
    ) {
      throw new BadRequestException("Invalid token format");
    }
    return this.invitationsService.acceptInvitation(token, userId);
  }

  @Get("/workspace-invitations/:token")
  @ApiOperation({ summary: "Get invitation details by token" })
  @ApiResponse({ status: 200, description: "Invitation details retrieved" })
  async getInvitationDetails(@Param("token") token: string) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        token,
      )
    ) {
      throw new BadRequestException("Invalid token format");
    }
    return this.invitationsService.getInvitationDetails(token);
  }
}
