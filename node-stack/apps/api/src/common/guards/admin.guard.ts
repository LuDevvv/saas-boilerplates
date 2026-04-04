import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user as any;
    // Expect a boolean flag on the user/identity indicating admin
    return (
      !!user?.isAdmin ||
      (!!user?.role && String(user.role).toLowerCase() === "admin")
    );
  }
}
