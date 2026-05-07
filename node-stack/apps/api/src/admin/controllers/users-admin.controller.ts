import { Controller, Get, Post, Patch, Body, Param, Query, Request } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger";
import { AuthRepository } from "@node-stack/db";
import { UpdateUserRoleSchema, UpdateUserRoleDto } from "@node-stack/validators";
import { ZodValidationPipe } from "nestjs-zod";

import { ImpersonationService } from "@/admin/services/impersonation.service.js";
import { AdminOnly } from "@/common/decorators/admin.decorator.js";

@ApiTags("admin-users")
@Controller("admin/users")
@AdminOnly()
export class UsersAdminController {
  constructor(
    private impersonationService: ImpersonationService,
    private authRepository: AuthRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get()
  @ApiOperation({ summary: "List all users (Admin only)" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({ status: 200, description: "List of users retrieved" })
  async listUsers(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("search") search?: string,
  ) {
    return this.authRepository.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
    });
  }

  @Patch(":id/role")
  @ApiOperation({ summary: "Update user role (Admin only)" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "User role updated successfully" })
  async updateUserRole(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateUserRoleSchema)) data: UpdateUserRoleDto,
    @Request() req: any,
  ) {
    const adminId = req.user.id;
    const oldUser = await this.authRepository.findUserById(id);
    
    const result = await this.authRepository.updateUser(id, { role: data.role });

    // Audit the high-privilege change
    this.eventEmitter.emit("audit.log", {
      action: "admin.user_role_changed",
      userId: adminId,
      entityType: "user",
      entityId: id,
      metadata: {
        previousRole: oldUser?.role,
        newRole: data.role,
      },
    });

    return result;
  }

  @Post(":id/impersonate")
  @ApiOperation({ summary: "Impersonate a user (Admin only)" })
  @ApiParam({ name: "id", description: "User ID to impersonate" })
  @ApiResponse({ status: 201, description: "Impersonation session created" })
  async impersonate(
    @Param("id") id: string,
    @Request() req: any,
  ) {
    const adminId = req.user.id;
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"];

    return this.impersonationService.impersonate(adminId, id, { 
      ipAddress, 
      userAgent 
    });
  }
}
