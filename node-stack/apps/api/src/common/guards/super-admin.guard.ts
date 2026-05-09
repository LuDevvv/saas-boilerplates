import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import type { Request } from "express";

interface SuperAdminRequest extends Request {
  user?: { role?: string };
}

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<SuperAdminRequest>();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Role check - must be super_admin
    const isSuperAdmin = user.role === "super_admin";

    if (!isSuperAdmin) {
      throw new ForbiddenException("Only super administrators can access this resource.");
    }

    return true;
  }
}
