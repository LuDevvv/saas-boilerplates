import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

/**
 * WorkspaceMemberGuard is now a no-op pass-through.
 * All role/permission checks are handled declaratively by
 * RolesGuard and PermissionsGuard using @Roles() and @RequirePermissions().
 *
 * This guard is kept for backward compatibility with existing
 * @UseGuards(WorkspaceMemberGuard) references.
 */
@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}
