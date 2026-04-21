import { Injectable } from "@nestjs/common";

import {
  Role,
  Permission,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  canManageMember,
} from "./permissions.js";

@Injectable()
export class RbacService {
  hasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role].includes(permission);
  }

  getPermissionsForRole(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role];
  }

  canManageMember(actorRole: Role, targetRole: Role): boolean {
    return canManageMember(actorRole, targetRole);
  }

  hasRoleHierarchy(actorRole: Role, requiredRole: Role): boolean {
    if (actorRole === requiredRole) return true;
    return ROLE_HIERARCHY[actorRole]?.includes(requiredRole) || false;
  }
}
