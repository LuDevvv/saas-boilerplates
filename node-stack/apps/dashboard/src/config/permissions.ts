import { Role } from "@/types/auth";

/**
 * Defining scopes as string literals
 */
export type Permission = 
  | 'workspace.view'
  | 'workspace.manage'
  | 'workspace.delete'
  | 'members.view'
  | 'members.invite'
  | 'members.manage'
  | 'api_keys.view'
  | 'api_keys.manage'
  | 'webhooks.view'
  | 'webhooks.manage'
  | 'billing.view'
  | 'billing.manage'
  | 'ai.execute';

/**
 * Mapping roles to permissions
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPERADMIN]: [
    'workspace.view', 'workspace.manage', 'workspace.delete',
    'members.view', 'members.invite', 'members.manage',
    'api_keys.view', 'api_keys.manage',
    'webhooks.view', 'webhooks.manage',
    'billing.view', 'billing.manage',
    'ai.execute'
  ],
  [Role.OWNER]: [
    'workspace.view', 'workspace.manage', 'workspace.delete',
    'members.view', 'members.invite', 'members.manage',
    'api_keys.view', 'api_keys.manage',
    'webhooks.view', 'webhooks.manage',
    'billing.view', 'billing.manage',
    'ai.execute'
  ],
  [Role.ADMIN]: [
    'workspace.view', 'workspace.manage',
    'members.view', 'members.invite', 'members.manage',
    'api_keys.view', 'api_keys.manage',
    'webhooks.view', 'webhooks.manage',
    'billing.view',
    'ai.execute'
  ],
  [Role.MEMBER]: [
    'workspace.view',
    'members.view',
    'api_keys.view',
    'webhooks.view'
  ],
};
