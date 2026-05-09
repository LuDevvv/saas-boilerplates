import { AxiosInstance } from "axios";
import {
  PaginatedResponse,
  AdminStats,
  AdminTrends,
  AdminUser,
} from "@node-stack/types";

export const admin = (client: AxiosInstance) => ({
  // ── Stats ──────────────────────────────────────────────────
  getStats: async (): Promise<AdminStats> => {
    return client.get("/admin/stats/overview").then((r) => r.data);
  },

  getTrends: async (days?: number): Promise<AdminTrends> => {
    return client.get("/admin/stats/trends", { params: { days } }).then((r) => r.data);
  },

  // ── Users ─────────────────────────────────────────────────
  listUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<AdminUser>> => {
    return client.get("/admin/users", { params }).then((r) => r.data);
  },

  updateUserStatus: async (
    userId: string,
    status: "active" | "suspended" | "banned",
    reason?: string,
  ): Promise<{ success: boolean; status: string; userId: string }> => {
    return client
      .patch(`/admin/users/${userId}/status`, { status, reason })
      .then((r) => r.data);
  },

  updateUserRole: async (
    userId: string,
    role: "user" | "admin" | "super_admin",
  ): Promise<AdminUser> => {
    return client
      .patch(`/admin/users/${userId}/role`, { role })
      .then((r) => r.data);
  },

  impersonateUser: async (
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    return client
      .post(`/admin/users/${userId}/impersonate`)
      .then((r) => r.data);
  },

  // ── Audit Logs ─────────────────────────────────────────────
  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    workspaceId?: string;
    from?: string;
    to?: string;
  }): Promise<{ data: any[]; meta: { total: number; page: number; limit: number; pages: number } }> => {
    return client.get("/admin/audit-logs", { params }).then((r) => r.data);
  },

  // ── Feature Flags ──────────────────────────────────────────
  getFeatureFlags: async (): Promise<
    Array<{ key: string; scope: string; scopeId: string | null; enabled: boolean }>
  > => {
    return client.get("/admin/feature-flags").then((r) => r.data);
  },

  enableFeatureFlag: async (
    flagKey: string,
    body?: {
      scope?: "global" | "workspace" | "user";
      workspaceId?: string;
      userId?: string;
    },
  ) => {
    return client
      .post(`/admin/feature-flags/${flagKey}/enable`, body ?? {})
      .then((r) => r.data);
  },

  disableFeatureFlag: async (
    flagKey: string,
    body?: {
      scope?: "global" | "workspace" | "user";
      workspaceId?: string;
      userId?: string;
    },
  ) => {
    return client
      .post(`/admin/feature-flags/${flagKey}/disable`, body ?? {})
      .then((r) => r.data);
  },

  toggleFeatureFlag: async (
    flagKey: string,
    enabled: boolean,
    body?: { scope?: "global" | "workspace" | "user"; workspaceId?: string; userId?: string },
  ) => {
    const endpoint = enabled ? "enable" : "disable";
    return client
      .post(`/admin/feature-flags/${flagKey}/${endpoint}`, body ?? {})
      .then((r) => r.data);
  },

  // ── Workspaces ─────────────────────────────────────────────
  listWorkspaces: async (params?: {
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
  }): Promise<{ data: any[]; meta: { total: number; page: number; limit: number; pages: number } }> => {
    return client.get("/admin/workspaces", { params }).then((r) => r.data);
  },

  getWorkspace: async (id: string): Promise<any> => {
    return client.get(`/admin/workspaces/${id}`).then((r) => r.data);
  },

  // ── System Config ──────────────────────────────────────────
  getAllConfig: async (): Promise<Record<string, unknown>> => {
    return client.get("/admin/config").then((r) => r.data);
  },

  setConfig: async (data: {
    key: string;
    value: unknown;
    description?: string;
  }) => {
    return client.post("/admin/config", data).then((r) => r.data);
  },

  refreshConfigCache: async (): Promise<{ success: boolean }> => {
    return client.post("/admin/config/refresh").then((r) => r.data);
  },
});
