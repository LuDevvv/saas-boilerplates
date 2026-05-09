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

/** Legacy flat shape — kept for backwards compat, prefer AdminStats */
export interface SystemStats {
  totalUsers: number;
  activeSubscriptions: number;
  revenue: number;
  mrr: number;
  newRegistrations: number;
  systemLoad: number;
}

export interface AdminStats {
  users: {
    total: number;
    activeSessions: number;
    dau: number;
    newThisWeek: number;
    newThisMonth: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
  };
  workspaces: {
    total: number;
    newThisMonth: number;
    byTier: Record<string, number>;
  };
  subscriptions: {
    active: number;
    byStatus: Record<string, number>;
  };
  ai: {
    totalTokens30d: number;
    byModel: Array<{ provider: string; model: string; totalTokens: number }>;
  };
  storage: {
    totalBytes: number;
    fileCount: number;
  };
  tickets: {
    byStatus: Record<string, number>;
    total: number;
  };
  tasks: {
    byStatus: Record<string, number>;
    completedThisWeek: number;
    total: number;
  };
  system: {
    uptimeSeconds: number;
    memoryUsedMb: number;
    memoryTotalMb: number;
    nodeVersion: string;
    status: "healthy" | "degraded" | "down";
  };
}

export interface AdminTrends {
  userGrowth: Array<{ date: string; count: number }>;
  activityTrend: Array<{ date: string; count: number }>;
  aiTrend: Array<{ date: string; tokens: number; calls: number }>;
  days: number;
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
