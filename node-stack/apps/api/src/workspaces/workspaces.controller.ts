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
import { 
  CreateWorkspaceDto, 
  UpdateMemberRoleDto,
  CreateApiKeyDto,
  UpdateWorkspaceDto,
} from "@node-stack/validators";

import { ApiKeysService } from "@/api-keys/api-keys.service.js";
import { CurrentUser } from "@/auth/decorators/index.js";
import { Idempotent } from "@/common/decorators/idempotent.decorator.js";
import { RequirePermissions } from "@/common/decorators/permissions.decorator.js";
import { Roles } from "@/common/decorators/roles.decorator.js";
import { TenantId } from "@/common/decorators/tenant-id.decorator.js";
import { Workspace } from "@/common/decorators/workspace.decorator.js";
import type { WorkspaceContext } from "@/common/types/index.js";
import { WorkspacesService } from "@/workspaces/workspaces.service.js";

@ApiTags("workspaces")
@ApiBearerAuth("JWT-auth")
@Idempotent()
@Controller("workspaces")
export class WorkspacesController {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly apiKeysService: ApiKeysService,
  ) {}

  @Post(":id/api-keys")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.WORKSPACE_WRITE)
  @ApiOperation({ 
    summary: "Generate API key for workspace",
    description: "Creates a new API key scoped to this specific workspace. Requires ADMIN role."
  })
  @ApiResponse({ status: 201, description: "API Key generated successfully" })
  async createApiKey(
    @TenantId() workspaceId: string,
    @CurrentUser("id") userId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    return this.apiKeysService.create(workspaceId, userId, dto);
  }

  @Get(":id/api-keys")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.WORKSPACE_READ)
  @ApiOperation({ 
    summary: "List workspace API keys",
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
  })
  @ApiResponse({ status: 200, description: "Key revoked successfully" })
  async revokeApiKey(
    @TenantId() workspaceId: string,
    @Param("keyId", ParseUUIDPipe) keyId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.apiKeysService.revoke(workspaceId, keyId, userId);
  }

  @Post()
  @ApiOperation({ 
    summary: "Create a brand new workspace",
    description: "Initializes a workspace with the current user as the OWNER."
  })
  @ApiResponse({ status: 201, description: "Workspace created successfully" })
  async createWorkspace(
    @Body() dto: CreateWorkspaceDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.workspacesService.createWorkspace(dto.name, dto.slug, userId);
  }

  @Get()
  @ApiOperation({ 
    summary: "List user workspaces",
  })
  @ApiResponse({ status: 200, description: "Workspaces retrieved" })
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

  @Get(":id")
  @Roles(Role.GUEST)
  @RequirePermissions(Permission.WORKSPACE_READ)
  @ApiOperation({ summary: "Get workspace details" })
  @ApiResponse({ status: 200, description: "Workspace details retrieved" })
  async getWorkspace(@Workspace() workspace: WorkspaceContext) {
    return workspace;
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.WORKSPACE_WRITE)
  @ApiOperation({ summary: "Update workspace details" })
  @ApiResponse({ status: 200, description: "Workspace updated successfully" })
  async updateWorkspace(
    @TenantId() workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.workspacesService.updateWorkspace(workspaceId, dto, userId);
  }

  @Get(":id/members")
  @Roles(Role.GUEST)
  @RequirePermissions(Permission.WORKSPACE_READ)
  @ApiOperation({ summary: "List workspace members" })
  @ApiResponse({ status: 200, description: "List of members retrieved" })
  async getMembers(
    @TenantId() workspaceId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.workspacesService.getMembers(workspaceId, userId);
  }

  @Patch(":id/members/:userId")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.MEMBER_INVITE)
  @ApiOperation({ summary: "Update member role" })
  @ApiResponse({ status: 200, description: "Member role updated" })
  async updateMemberRole(
    @TenantId() workspaceId: string,
    @Param("userId", ParseUUIDPipe) targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser("id") userId: string,
  ) {
    await this.workspacesService.updateMemberRole(
      workspaceId,
      targetUserId,
      dto.role,
      userId,
    );
    return { message: "Member role updated successfully" };
  }

  @Delete(":id/members/:userId")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.MEMBER_REMOVE)
  @ApiOperation({ summary: "Remove member from workspace" })
  @ApiResponse({ status: 200, description: "Member removed" })
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

