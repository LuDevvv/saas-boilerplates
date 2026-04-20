import { Controller, Get, Post, Patch, Body, Param, Query, Request } from "@nestjs/common";
import { AdminOnly } from "../../common/decorators/admin.decorator";
import { ImpersonationService } from "../services/impersonation.service";
import { AuthRepository } from "@node-stack/db";
import { ZodValidationPipe } from "nestjs-zod";
import { UpdateUserRoleSchema, type UpdateUserRoleDto } from "@node-stack/validators";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Controller("admin/users")
@AdminOnly()
export class UsersAdminController {
  constructor(
    private impersonationService: ImpersonationService,
    private authRepository: AuthRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get()
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
      action: "user.role_updated",
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
