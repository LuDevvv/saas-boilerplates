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

import { JwtAuthGuard } from "../auth/guards/jwt.guard.js";
import { WorkspaceGuard } from "../common/guards/workspace.guard.js";
import { RolesGuard } from "../common/guards/roles.guard.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { TenantId } from "../common/decorators/tenant-id.decorator.js";
import { Workspace } from "../common/decorators/workspace.decorator.js";
import type { WorkspaceContext } from "../common/types/index.js";

import {
  CreateTicketDto,
  UpdateTicketDto,
  ListTicketQueryDto,
  TicketResponseDto,
} from "@node-stack/validators";

import { TicketService } from "./tickets.service.js";

@ApiTags("ticket")
@ApiBearerAuth("JWT-auth")
@Controller("ticket")
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: "Create a new ticket" })
  @ApiResponse({ status: 201, description: "Ticket created successfully", type: TicketResponseDto })
  @ApiResponse({ status: 400, description: "Validation failed" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateTicketDto,
    @TenantId() workspaceId: string,
    @CurrentUser("id") userId: string,
  ): Promise<TicketResponseDto> {
    return this.ticketService.create(workspaceId, userId, dto);
  }

  @Get()
  @Roles(Role.GUEST)
  @ApiOperation({ summary: "List tickets for workspace" })
  @ApiResponse({ status: 200, description: "tickets list retrieved", type: [TicketResponseDto] })
  async list(
    @Query() query: ListTicketQueryDto,
    @Workspace() workspace: WorkspaceContext,
  ): Promise<{ data: TicketResponseDto[]; nextCursor?: string }> {
    return this.ticketService.list(workspace.id, query);
  }

  @Get(":id")
  @Roles(Role.GUEST)
  @ApiOperation({ summary: "Get ticket by ID" })
  @ApiResponse({ status: 200, description: "Ticket retrieved", type: TicketResponseDto })
  @ApiResponse({ status: 404, description: "Ticket not found" })
  @ApiParam({ name: "id", description: "Ticket UUID" })
  async get(
    @Param("id", ParseUUIDPipe) id: string,
    @Workspace() workspace: WorkspaceContext,
  ): Promise<TicketResponseDto> {
    return this.ticketService.findById(workspace.id, id);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Update ticket" })
  @ApiResponse({ status: 200, description: "Ticket updated", type: TicketResponseDto })
  @ApiResponse({ status: 404, description: "Ticket not found" })
  @ApiParam({ name: "id", description: "Ticket UUID" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
    @TenantId() workspaceId: string,
  ): Promise<TicketResponseDto> {
    return this.ticketService.update(workspaceId, id, dto);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Delete ticket (soft delete)" })
  @ApiResponse({ status: 200, description: "Ticket deleted successfully" })
  @ApiResponse({ status: 404, description: "Ticket not found" })
  @ApiParam({ name: "id", description: "Ticket UUID" })
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param("id", ParseUUIDPipe) id: string,
    @TenantId() workspaceId: string,
  ): Promise<{ message: string }> {
    await this.ticketService.softDelete(workspaceId, id);
    return { message: "Ticket deleted successfully" };
  }
}
