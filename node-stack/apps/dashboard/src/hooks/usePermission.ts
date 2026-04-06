import { useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { ROLE_PERMISSIONS, Permission } from "@/config/permissions";
import { Role } from "@/types/auth";

/**
 * Access control hook for RBAC (Role-Based Access Control)
 * Checks permissions based on the user's role in the active workspace.
 */
export const usePermission = () => {
  const { user } = useAuthStore();
  const { activeWorkspaceId } = useWorkspaceStore();

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;

      // Global SuperAdmin bypasses all checks
      if (user.role === Role.SUPERADMIN) return true;

      // Find user role for the active workspace
      const membership = user.memberships?.find(
        (m) => m.workspaceId === activeWorkspaceId
      );

      // Default role to MEMBER if not found, or could be the global user.role if applicable
      const userRoleInWorkspace = (membership?.role || user.role) as Role;

      // Get permissions for that role
      const permissions = ROLE_PERMISSIONS[userRoleInWorkspace] || [];

      return permissions.includes(permission);
    },
    [user, activeWorkspaceId]
  );

  return { hasPermission };
};
