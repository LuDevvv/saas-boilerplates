import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { Role } from "@node-stack/types";

import { JwtAuthGuard } from "../../auth/guards/jwt.guard.js";
import { WorkspaceGuard } from "../../common/guards/workspace.guard.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import { TenantId } from "../../common/decorators/tenant-id.decorator.js";
import { Workspace } from "../../common/decorators/workspace.decorator.js";
import type { WorkspaceContext } from "../../common/types/index.js";

import {
  Create{!!ModuleName}Dto,
  Update{!!ModuleName}Dto,
  List{!!ModuleName}QueryDto,
  {!!ModuleName}ResponseDto,
} from "@node-stack/validators";

import { {!!ModuleName}Service } from "./{!!moduleNamePlural}.service.js";

@ApiTags("{!!moduleName}")
@ApiBearerAuth("JWT-auth")
@Controller("{!!moduleName}")
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
export class {!!ModuleName}Controller {
  constructor(
    private readonly {!!moduleNameCamel}Service: {!!ModuleName}Service,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: "Create a new {!!moduleName}" })
  @ApiResponse({ status: 201, description: "{!!ModuleName} created successfully", type: {!!ModuleName}ResponseDto })
  @ApiResponse({ status: 400, description: "Validation failed" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: Create{!!ModuleName}Dto,
    @TenantId() workspaceId: string,
    @CurrentUser("id") userId: string,
  ): Promise<{!!ModuleName}ResponseDto> {
    return this.{!!moduleNameCamel}Service.create(workspaceId, userId, dto);
  }

  @Get()
  @Roles(Role.GUEST)
  @ApiOperation({ summary: "List {!!moduleNamePlural} for workspace" })
  @ApiResponse({ status: 200, description: "{!!moduleNamePlural} list retrieved", type: [{!!ModuleName}ResponseDto] })
  async list(
    @Query() query: List{!!ModuleName}QueryDto,
    @Workspace() workspace: WorkspaceContext,
  ): Promise<{ data: {!!ModuleName}ResponseDto[]; nextCursor?: string }> {
    return this.{!!moduleNameCamel}Service.list(workspace.id, query);
  }

  @Get(":id")
  @Roles(Role.GUEST)
  @ApiOperation({ summary: "Get {!!moduleName} by ID" })
  @ApiResponse({ status: 200, description: "{!!ModuleName} retrieved", type: {!!ModuleName}ResponseDto })
  @ApiResponse({ status: 404, description: "{!!ModuleName} not found" })
  @ApiParam({ name: "id", description: "{!!ModuleName} UUID" })
  async get(
    @Param("id", ParseUUIDPipe) id: string,
    @Workspace() workspace: WorkspaceContext,
  ): Promise<{!!ModuleName}ResponseDto> {
    return this.{!!moduleNameCamel}Service.findById(workspace.id, id);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Update {!!moduleName}" })
  @ApiResponse({ status: 200, description: "{!!ModuleName} updated", type: {!!ModuleName}ResponseDto })
  @ApiResponse({ status: 404, description: "{!!ModuleName} not found" })
  @ApiParam({ name: "id", description: "{!!ModuleName} UUID" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: Update{!!ModuleName}Dto,
    @TenantId() workspaceId: string,
  ): Promise<{!!ModuleName}ResponseDto> {
    return this.{!!moduleNameCamel}Service.update(workspaceId, id, dto);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Delete {!!moduleName} (soft delete)" })
  @ApiResponse({ status: 200, description: "{!!ModuleName} deleted successfully" })
  @ApiResponse({ status: 404, description: "{!!ModuleName} not found" })
  @ApiParam({ name: "id", description: "{!!ModuleName} UUID" })
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param("id", ParseUUIDPipe) id: string,
    @TenantId() workspaceId: string,
  ): Promise<{ message: string }> {
    await this.{!!moduleNameCamel}Service.softDelete(workspaceId, id);
    return { message: "{!!ModuleName} deleted successfully" };
  }
}
