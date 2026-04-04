import {
  createParamDecorator,
  ExecutionContext,
  UseGuards,
  applyDecorators,
  Injectable,
  CanActivate,
  BadRequestException,
} from "@nestjs/common";

import { Role, Permission } from "./permissions";
import { RbacService } from "./rbac.service";

export type WorkspaceContext = {
  id: string;
  name: string;
  role: string;
};

export interface WorkspaceRequest {
  workspace?: WorkspaceContext;
  user?: { id: string };
}

export const RequirePermission = (permission: Permission) => {
  return applyDecorators(UseGuards(new PermissionGuard(permission)));
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly permission: Permission) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest() as WorkspaceRequest;
    const workspace = request.workspace;
    const user = request.user;

    if (!workspace) {
      throw new BadRequestException(
        "Workspace context not found. Use WorkspaceGuard before PermissionGuard.",
      );
    }

    if (!user) {
      throw new BadRequestException(
        "User not authenticated. Use JwtAuthGuard before PermissionGuard.",
      );
    }

    const rbacService = new RbacService();
    const hasPermission = rbacService.hasPermission(
      workspace.role as Role,
      this.permission,
    );

    if (!hasPermission) {
      throw new Error(`Permission denied: ${this.permission}`);
    }

    return hasPermission;
  }
}
