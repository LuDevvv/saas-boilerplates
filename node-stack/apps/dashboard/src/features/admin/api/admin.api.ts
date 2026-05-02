import { apiClient } from "@/shared/lib/api";

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

export const adminApi = {
  getStats: (): Promise<SystemStats> =>
    apiClient.get("/admin/stats"),

  getUsers: (): Promise<AdminUser[]> =>
    apiClient.get("/admin/users"),

  updateUserStatus: (userId: string, status: string): Promise<void> =>
    apiClient.patch(`/admin/users/${userId}/status`, { status }),

  updateUserRole: (userId: string, role: string): Promise<void> =>
    apiClient.patch(`/admin/users/${userId}/role`, { role }),

  getFeatureFlags: (): Promise<FeatureFlag[]> =>
    apiClient.get("/admin/feature-flags"),

  toggleFeatureFlag: (flagId: string, enabled: boolean): Promise<void> =>
    apiClient.patch("/admin/feature-flags", { id: flagId, enabled }),

  getAuditLogs: (): Promise<AuditLog[]> =>
    apiClient.get("/admin/audit-logs"),
};