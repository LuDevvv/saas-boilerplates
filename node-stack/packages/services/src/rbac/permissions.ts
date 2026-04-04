export type Permission = string;

export type Role = "owner" | "admin" | "member";

export interface PermissionConfig {
  permissions: Permission[];
  higherRoles?: Role[];
}

export const PERMISSIONS = {
  // Workspace
  WORKSPACE_READ: "workspace:read",
  WORKSPACE_WRITE: "workspace:write",
  WORKSPACE_DELETE: "workspace:delete",

  // Member
  MEMBER_MANAGE: "member:manage",
  MEMBER_INVITE: "member:invite",
  MEMBER_REMOVE: "member:remove",

  // Billing
  BILLING_MANAGE: "billing:manage",
  BILLING_VIEW: "billing:view",

  // Invitations
  INVITATION_CREATE: "invitation:create",
  INVITATION_VIEW: "invitation:view",
  INVITATION_CANCEL: "invitation:cancel",

  // Audit
  AUDIT_VIEW: "audit:view",
} as const;

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.WORKSPACE_WRITE,
    PERMISSIONS.WORKSPACE_DELETE,
    PERMISSIONS.MEMBER_MANAGE,
    PERMISSIONS.MEMBER_INVITE,
    PERMISSIONS.MEMBER_REMOVE,
    PERMISSIONS.BILLING_MANAGE,
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.INVITATION_CREATE,
    PERMISSIONS.INVITATION_VIEW,
    PERMISSIONS.INVITATION_CANCEL,
    PERMISSIONS.AUDIT_VIEW,
  ],
  admin: [
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.WORKSPACE_WRITE,
    PERMISSIONS.MEMBER_MANAGE,
    PERMISSIONS.MEMBER_INVITE,
    PERMISSIONS.MEMBER_REMOVE,
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.INVITATION_CREATE,
    PERMISSIONS.INVITATION_VIEW,
    PERMISSIONS.INVITATION_CANCEL,
    PERMISSIONS.AUDIT_VIEW,
  ],
  member: [PERMISSIONS.WORKSPACE_READ],
};

export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  owner: ["admin", "member"],
  admin: ["member"],
  member: [],
};

export const canManageMember = (actorRole: Role, targetRole: Role): boolean => {
  if (actorRole === "owner") return true;
  if (
    actorRole === "admin" &&
    (targetRole === "member" || targetRole === "admin")
  )
    return true;
  return false;
};
