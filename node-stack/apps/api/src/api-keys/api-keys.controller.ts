import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service.js';
import { CreateApiKeyDto } from '@node-stack/validators';
import { JwtAuthGuard } from '../auth/guards/jwt.guard.js';
import { WorkspaceGuard } from '../common/guards/workspace.guard.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { Permission } from '@node-stack/types';
import { Idempotent } from '../common/decorators/idempotent.decorator.js';

@ApiTags('api-keys')
@ApiBearerAuth('JWT-auth')
@Idempotent()
@Controller('api-keys')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class ApiKeysController {
  constructor(private readonly service: ApiKeysService) {}

  @Post()
  @Permissions(Permission.WORKSPACE_WRITE)
  @ApiOperation({ 
    summary: 'Create a new API Key',
    description: 'Generates a unique API key for programmatic access. Use with Header X-API-KEY.'
  })
  @ApiResponse({ status: 201, description: 'API Key created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async create(@Body() body: CreateApiKeyDto, @Request() req: any) {
    return this.service.create(
      req.workspace.id,
      req.user.id,
      body,
    );
  }

  @Get()
  @Permissions(Permission.WORKSPACE_READ)
  @ApiOperation({ 
    summary: 'List active API Keys',
    description: 'Returns a list of non-revoked API keys for the current workspace context.'
  })
  @ApiResponse({ status: 200, description: 'List of API keys retrieved' })
  async list(@Request() req: any) {
    return this.service.list(req.workspace.id);
  }

  @Delete(':id')
  @Permissions(Permission.WORKSPACE_WRITE)
  @ApiOperation({ 
    summary: 'Revoke an API Key',
    description: 'Permanently disables an API key. Once revoked, it cannot be used for authentication.'
  })
  @ApiResponse({ status: 200, description: 'API Key revoked successfully' })
  @ApiResponse({ status: 404, description: 'API Key not found or does not belong to workspace' })
  async revoke(@Param('id') id: string, @Request() req: any) {
    return this.service.revoke(req.workspace.id, id);
  }
}
