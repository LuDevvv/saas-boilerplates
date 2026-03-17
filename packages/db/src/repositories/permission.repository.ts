import { eq, and, inArray } from "drizzle-orm";
import type { Database } from "../db";
import { memberships } from "../schema/workspaces";
import { rolePermissions, permissions } from "../schema/permissions";

/**
 * Repository for managing access control logic.
 */
export const PermissionRepository = {
  /**
   * Checks if a user has a specific permission within a workspace.
   * Joins Membership -> RolePermissions -> Permissions for a definitive check.
   */
  async hasPermission(
    db: Database,
    userId: string,
    workspaceId: string,
    permissionId: string,
  ): Promise<boolean> {
    // 1. Get user's role in the workspace
    const membership = await db
      .select({ role: memberships.role })
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, userId),
          eq(memberships.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!membership[0]) return false;

    // 2. Check if that role has the required permission
    const access = await db
      .select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.role, membership[0].role),
          eq(rolePermissions.permissionId, permissionId),
        ),
      )
      .limit(1);

    return access.length > 0;
  },

  /**
   * Retrieves all assigned permissions for a user's role in a workspace.
   */
  async getEffectivePermissions(
    db: Database,
    userId: string,
    workspaceId: string,
  ): Promise<string[]> {
    const result = await db
      .select({ permissionId: rolePermissions.permissionId })
      .from(memberships)
      .innerJoin(rolePermissions, eq(memberships.role, rolePermissions.role))
      .where(
        and(
          eq(memberships.userId, userId),
          eq(memberships.workspaceId, workspaceId),
        ),
      );

    return result.map((r: any) => r.permissionId);
  },
};
