import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role, ROLE_HIERARCHY } from "@node-stack/types";

import { ROLES_KEY } from "../decorators/roles.decorator.js";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException("Authentication required");

    const userRole = user.workspaceRole as Role;
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
    const minRequired = Math.min(
      ...requiredRoles.map((r) => ROLE_HIERARCHY[r] ?? Infinity),
    );

    if (userLevel < minRequired) {
      throw new ForbiddenException(
        `Requires role: ${requiredRoles.join(" or ")} (or higher)`,
      );
    }

    return true;
  }
}
