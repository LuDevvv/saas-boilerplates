import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { Role, Permission } from "@node-stack/types";
import type { PaginationDto } from "@node-stack/utils";

import { createWorkspaceDto } from "./dto/create-workspace.dto";
import { updateMemberRoleDto } from "./dto/update-member.dto";
import { WorkspacesService } from "./workspaces.service";
import { ApiKeysService } from "../api-keys/api-keys.service";
import { CreateApiKeyDto, createApiKeySchema } from "./dto/api-key.dto";
import { CurrentUser } from "../auth/decorators";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { TenantId } from "../common/decorators/tenant-id.decorator";
import { Workspace } from "../common/decorators/workspace.decorator";
import { IdempotencyGuard } from "../common/guards/idempotency.guard";
import { IdempotencyInterceptor } from "../common/interceptors/idempotency.interceptor";
import { WorkspaceContext } from "../common/types";

@ApiTags("workspaces")
@ApiBearerAuth("JWT-auth")
@Controller("workspaces")
export class WorkspacesController {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly apiKeysService: ApiKeysService,
  ) {}

  // API Key Management Endpoints
  @Post(":id/api-keys")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.WORKSPACE_WRITE)
  @ApiOperation({ 
    summary: "Generate API key for workspace",
    description: "Creates a new API key scoped to this specific workspace. Requires ADMIN role."
  })
  @ApiResponse({ status: 201, description: "API Key generated successfully" })
  @ApiResponse({ status: 403, description: "Forbidden - Requires ADMIN role and WORKSPACE_WRITE permission" })
  async createApiKey(
    @TenantId() workspaceId: string,
    @CurrentUser("id") userId: string,
    @Body() body: unknown,
  ) {
    const dto = createApiKeySchema.parse(body);
    return this.apiKeysService.create(workspaceId, userId, dto);
  }

  @Get(":id/api-keys")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.WORKSPACE_READ)
  @ApiOperation({ 
    summary: "List workspace API keys",
    description: "Returns all active API keys for the specified workspace."
  })
  @ApiResponse({ status: 200, description: "List of API keys retrieved" })
  async listApiKeys(@TenantId() workspaceId: string) {
    return this.apiKeysService.list(workspaceId);
  }

  @Delete(":id/api-keys/:keyId")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.WORKSPACE_WRITE)
  @ApiOperation({ 
    summary: "Revoke workspace API key",
    description: "Immediately invalidates a specific API key within the workspace context."
  })
  @ApiResponse({ status: 200, description: "Key revoked successfully" })
  async revokeApiKey(
    @TenantId() workspaceId: string,
    @Param("keyId", ParseUUIDPipe) keyId: string,
  ) {
    return this.apiKeysService.revoke(workspaceId, keyId);
  }

  // Any authenticated user can create a workspace
  @Post()
  @UseGuards(IdempotencyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ 
    summary: "Create a brand new workspace",
    description: "Initializes a workspace with the current user as the OWNER. Automatically generates a unique slug if not provided."
  })
  @ApiResponse({ status: 201, description: "Workspace created successfully" })
  @ApiResponse({ status: 409, description: "Slug already in use" })
  async createWorkspace(
    @Body() body: unknown,
    @CurrentUser("id") userId: string,
  ) {
    const dto = createWorkspaceDto.parse(body);
    return this.workspacesService.createWorkspace(dto.name, dto.slug, userId);
  }

  // Any authenticated user can list their workspaces
  @Get()
  @ApiOperation({ 
    summary: "List user workspaces",
    description: "Retrieves all workspaces where the current user is a member. Supports cursor-based pagination."
  })
  @ApiResponse({ status: 200, description: "Workspaces retrieved with membership info" })
  async listWorkspaces(
    @Query() query: PaginationDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.workspacesService.listWorkspaces(
      userId,
      query.cursor,
      query.limit,
    );
  }

  // Any workspace member can read workspace details
  @Get(":id")
  @Roles(Role.GUEST)
  @RequirePermissions(Permission.WORKSPACE_READ)
  @ApiOperation({ 
    summary: "Get workspace details",
    description: "Returns the workspace metadata including current member count and settings."
  })
  @ApiResponse({ status: 200, description: "Workspace found and returned" })
  @ApiResponse({ status: 404, description: "Workspace not found" })
  async getWorkspace(@Workspace() workspace: WorkspaceContext) {
    return workspace;
  }

  // Any workspace member can read members
  @Get(":id/members")
  @Roles(Role.GUEST)
  @RequirePermissions(Permission.WORKSPACE_READ)
  @ApiOperation({ 
    summary: "List workspace members",
    description: "Retrieves a list of all users and their roles within the workspace."
  })
  @ApiResponse({ status: 200, description: "Member list retrieved" })
  async getMembers(
    @TenantId() workspaceId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.workspacesService.getMembers(workspaceId, userId);
  }

  // Any workspace member can read their own membership
  @Get(":id/members/me")
  @Roles(Role.GUEST)
  @RequirePermissions(Permission.WORKSPACE_READ)
  @ApiOperation({ 
    summary: "Get my membership details",
    description: "Returns the role and specific permissions of the current user in this workspace."
  })
  @ApiResponse({ status: 200, description: "Membership details retrieved" })
  async getMyMembership(
    @TenantId() workspaceId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.workspacesService.getMyMembership(workspaceId, userId);
  }

  // Only admins/owners can update member roles
  @Patch(":id/members/:userId")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.MEMBER_INVITE)
  @ApiOperation({ 
    summary: "Update member role",
    description: "Changes a member's role (e.g., from GUEST to ADMIN). Requires ADMIN role."
  })
  @ApiResponse({ status: 200, description: "Role updated successfully" })
  @ApiResponse({ status: 403, description: "Insufficient permissions or higher role required" })
  async updateMemberRole(
    @TenantId() workspaceId: string,
    @Param("userId", ParseUUIDPipe) targetUserId: string,
    @Body() body: unknown,
    @CurrentUser("id") userId: string,
  ) {
    const dto = updateMemberRoleDto.parse(body);
    await this.workspacesService.updateMemberRole(
      workspaceId,
      targetUserId,
      dto.role,
      userId,
    );
    return { message: "Member role updated successfully" };
  }

  // Only admins/owners can remove members
  @Delete(":id/members/:userId")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.MEMBER_REMOVE)
  @ApiOperation({ 
    summary: "Remove member from workspace",
    description: "Evicts a member from the workspace. Only ADMINs can remove members. OWNER cannot be removed."
  })
  @ApiResponse({ status: 200, description: "Member removed successfully" })
  @ApiResponse({ status: 400, description: "Cannot remove the workspace OWNER" })
  async removeMember(
    @TenantId() workspaceId: string,
    @Param("userId", ParseUUIDPipe) targetUserId: string,
    @CurrentUser("id") userId: string,
  ) {
    await this.workspacesService.removeMember(
      workspaceId,
      targetUserId,
      userId,
    );
    return { message: "Member removed successfully" };
  }
}
