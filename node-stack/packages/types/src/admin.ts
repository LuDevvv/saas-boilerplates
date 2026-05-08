export interface UpdateUserRoleDto {
  role: string;
}

export type SetConfigDto = Record<string, unknown>;

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userEmail?: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  activeSubscriptions: number;
  revenue: number;
  mrr: number;
  newRegistrations: number;
  systemLoad: number;
}

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: "user" | "admin" | "super_admin";
  status: "active" | "suspended" | "banned";
  statusReason?: string | null;
  statusChangedAt?: string | null;
  createdAt: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}
