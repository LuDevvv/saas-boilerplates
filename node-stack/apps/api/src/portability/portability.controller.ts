import {
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { Role, Permission } from "@node-stack/types";

import { CurrentUser } from "@/auth/decorators/index.js";
import { AuditLog } from "@/common/decorators/audit-log.decorator.js";
import { RequirePermissions } from "@/common/decorators/permissions.decorator.js";
import { Roles } from "@/common/decorators/roles.decorator.js";
import { TenantId } from "@/common/decorators/tenant-id.decorator.js";
import { PortabilityService } from "@/portability/portability.service.js";

@ApiTags("portability")
@ApiBearerAuth("JWT-auth")
@Controller("workspaces/:id/portability")
export class PortabilityController {
  constructor(private readonly portabilityService: PortabilityService) {}

  @Post()
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.WORKSPACE_WRITE)
  @AuditLog("workspace.portability_requested")
  @ApiOperation({ 
    summary: "Request workspace data export",
    description: "Triggers a background job to export all workspace data for HIPAA/compliance."
  })
  @ApiResponse({ status: 202, description: "Export request accepted and queued" })
  async requestExport(
    @TenantId() workspaceId: string,
    @CurrentUser("id") userId: string,
  ): Promise<{ requestId: string; status: string }> {
    return this.portabilityService.requestExport(workspaceId, userId);
  }

  @Get()
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.WORKSPACE_READ)
  @AuditLog("workspace.portability_list_viewed")
  @ApiOperation({ 
    summary: "List all export requests for this workspace",
  })
  @ApiResponse({ status: 200, description: "List of export requests retrieved" })
  async listRequests(@TenantId() workspaceId: string): Promise<Record<string, unknown>[]> {
    return this.portabilityService.listRequests(workspaceId) as Promise<Record<string, unknown>[]>;
  }

  @Get(":requestId")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.WORKSPACE_READ)
  @AuditLog("workspace.portability_request_viewed")
  @ApiOperation({ 
    summary: "Get status and details of a specific export request",
  })
  @ApiResponse({ status: 200, description: "Export request details retrieved" })
  async getRequest(
    @TenantId() workspaceId: string,
    @Param("requestId", ParseUUIDPipe) requestId: string,
  ): Promise<Record<string, unknown>> {
    return this.portabilityService.getRequest(requestId, workspaceId) as Promise<Record<string, unknown>>;
  }

  @Get(":requestId/download")
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.WORKSPACE_READ)
  @AuditLog("workspace.portability_downloaded")
  @ApiOperation({ 
    summary: "Get a secure download link for the export package",
    description: "Returns a temporary signed URL valid for 1 hour."
  })
  @ApiResponse({ status: 200, description: "Signed URL generated successfully" })
  async download(
    @TenantId() workspaceId: string,
    @CurrentUser("id") userId: string,
    @Param("requestId", ParseUUIDPipe) requestId: string,
  ): Promise<{ url: string }> {
    return this.portabilityService.getDownloadUrl(requestId, workspaceId, userId);
  }
}
