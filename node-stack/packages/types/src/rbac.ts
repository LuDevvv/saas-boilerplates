export enum Role {
  SUPER_ADMIN = "super_admin",
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  GUEST = "guest",
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 100,
  [Role.OWNER]: 75,
  [Role.ADMIN]: 50,
  [Role.MEMBER]: 25,
  [Role.GUEST]: 10,
};

export enum Permission {
  WORKSPACE_READ = "workspace:read",
  WORKSPACE_WRITE = "workspace:write",
  WORKSPACE_DELETE = "workspace:delete",
  BILLING_READ = "billing:read",
  BILLING_WRITE = "billing:write",
  MEMBER_INVITE = "member:invite",
  MEMBER_REMOVE = "member:remove",
}

export enum ApiKeyScope {
  WORKSPACES_READ  = 'workspaces:read',
  WORKSPACES_WRITE = 'workspaces:write',
  BILLING_READ     = 'billing:read',
  TASKS_READ       = 'tasks:read',
  TASKS_WRITE      = 'tasks:write',
  AI_JOBS          = 'ai:jobs',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  [Role.OWNER]: Object.values(Permission),
  [Role.ADMIN]: [
    Permission.WORKSPACE_READ,
    Permission.WORKSPACE_WRITE,
    Permission.WORKSPACE_DELETE,
    Permission.BILLING_READ,
    Permission.BILLING_WRITE,
    Permission.MEMBER_INVITE,
    Permission.MEMBER_REMOVE,
  ],
  [Role.MEMBER]: [
    Permission.WORKSPACE_READ,
    Permission.WORKSPACE_WRITE,
    Permission.BILLING_READ,
    Permission.MEMBER_INVITE,
  ],
  [Role.GUEST]: [Permission.WORKSPACE_READ],
};
