import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import type { Request } from "express";

import type { UserPayload } from "@/common/types/index.js";

interface AdminRequest extends Request {
  user?: UserPayload & { role?: string; isAdmin?: boolean };
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AdminRequest>();
    const user = req.user;
    const role = String(user?.role ?? "").toLowerCase();
    const isAdmin = !!user?.isAdmin || role === "admin" || role === "super_admin";
    if (!isAdmin) {
      throw new ForbiddenException("Admin access required");
    }
    return true;
  }
}
