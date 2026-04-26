import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role, Permission, ROLE_PERMISSIONS } from "@node-stack/types";

import { PERMISSIONS_KEY } from "@/common/decorators/permissions.decorator.js";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException("Authentication required");

    const userRole = user.workspaceRole as Role;
    const userPerms = ROLE_PERMISSIONS[userRole] ?? [];

    const missing = required.filter((p) => !userPerms.includes(p));
    if (missing.length > 0) {
      throw new ForbiddenException(
        `Missing permissions: ${missing.join(", ")}`,
      );
    }

    return true;
  }
}
