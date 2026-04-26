import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { Role, Permission } from "@node-stack/types";

import { RequirePermissions } from "@/common/decorators/permissions.decorator.js";
import { Roles } from "@/common/decorators/roles.decorator.js";
import { TenantId } from "@/common/decorators/tenant-id.decorator.js";
import { WebhooksService } from "@/workspaces/webhooks.service.js";

@ApiTags("workspaces")
@ApiBearerAuth("JWT-auth")
@Controller("workspaces/:id/webhooks")
@Roles(Role.ADMIN)
@RequirePermissions(Permission.WORKSPACE_WRITE)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @ApiOperation({ summary: "Create a new webhook endpoint" })
  async create(
    @TenantId() workspaceId: string,
    @Body() body: { url: string; eventTypes: string[] }
  ) {
    return this.webhooksService.create(workspaceId, body);
  }

  @Get()
  @RequirePermissions(Permission.WORKSPACE_READ)
  @ApiOperation({ summary: "List webhook endpoints" })
  async list(@TenantId() workspaceId: string) {
    return this.webhooksService.list(workspaceId);
  }

  @Delete(":webhookId")
  @ApiOperation({ summary: "Delete a webhook endpoint" })
  async delete(
    @TenantId() workspaceId: string,
    @Param("webhookId", ParseUUIDPipe) webhookId: string
  ) {
    return this.webhooksService.delete(workspaceId, webhookId);
  }

  @Get(":webhookId/deliveries")
  @RequirePermissions(Permission.WORKSPACE_READ)
  @ApiOperation({ summary: "Get webhook delivery history" })
  async getDeliveries(
    @TenantId() workspaceId: string,
    @Param("webhookId", ParseUUIDPipe) webhookId: string
  ) {
    return this.webhooksService.getDeliveries(workspaceId, webhookId);
  }

  @Post(":webhookId/test")
  @ApiOperation({ summary: "Send a test webhook event" })
  async test(
    @TenantId() workspaceId: string,
    @Param("webhookId", ParseUUIDPipe) webhookId: string
  ) {
    return this.webhooksService.test(workspaceId, webhookId);
  }

  @Post(":webhookId/rotate-secret")
  @ApiOperation({ summary: "Rotate webhook secret" })
  async rotateSecret(
    @TenantId() workspaceId: string,
    @Param("webhookId", ParseUUIDPipe) webhookId: string
  ) {
    return this.webhooksService.rotateSecret(workspaceId, webhookId);
  }
}
