export interface UpdateUserRoleDto {
  role: string;
}

export type SetConfigDto = any;

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
  name: string;
  email: string;
  role: string;
  status: "Active" | "Pending" | "Suspended" | "Banned";
  createdAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}
