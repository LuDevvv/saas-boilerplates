import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user as any;
    const role = String(user?.role ?? "").toLowerCase();
    const isAdmin = !!user?.isAdmin || role === "admin" || role === "super_admin";
    if (!isAdmin) {
      throw new ForbiddenException("Admin access required");
    }
    return true;
  }
}
