import { AxiosInstance } from "axios";
import { 
  PaginatedResponse, 
  SystemStats, 
  AdminUser, 
  UpdateUserRoleDto,
} from "@node-stack/types";

export const admin = (client: AxiosInstance) => ({
  getStats: async () => {
    const { data } = await client.get<{ data: SystemStats }>("/admin/stats/overview");
    return data.data;
  },

  listUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await client.get<PaginatedResponse<AdminUser>>("/admin/users", { params });
    return data;
  },

  updateUserStatus: async (userId: string, status: string) => {
    const { data: response } = await client.patch<{ data: AdminUser }>(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const { data: response } = await client.patch<{ data: AdminUser }>(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  getFeatureFlags: async () => {
    const { data } = await client.get<{ data: any[] }>("/admin/feature-flags");
    return data.data;
  },

  toggleFeatureFlag: async (flagId: string, enabled: boolean) => {
    const { data } = await client.post<{ data: any }>(`/admin/feature-flags/${flagId}/toggle`, { enabled });
    return data.data;
  },

  getAuditLogs: async () => {
    const { data } = await client.get<{ data: any[] }>("/admin/audit-logs");
    return data.data;
  },

  impersonateUser: async (userId: string) => {
    const { data } = await client.post<{ data: { accessToken: string; refreshToken: string } }>(`/admin/users/${userId}/impersonate`);
    return data.data;
  },

  enableFeatureFlag: async (flagKey: string, body?: { scope?: "global" | "workspace" | "user"; workspaceId?: string; userId?: string }) => {
    const { data } = await client.post<{ data: any }>(`/admin/feature-flags/${flagKey}/enable`, body || {});
    return data.data;
  },

  disableFeatureFlag: async (flagKey: string, body?: { scope?: "global" | "workspace" | "user"; workspaceId?: string; userId?: string }) => {
    const { data } = await client.post<{ data: any }>(`/admin/feature-flags/${flagKey}/disable`, body || {});
    return data.data;
  },

  getAllConfig: async () => {
    const { data } = await client.get<{ data: any }>("/admin/config");
    return data.data;
  },

  setConfig: async (data: { key: string; value: string; description?: string }) => {
    const { data: response } = await client.post<{ data: any }>("/admin/config", data);
    return response.data;
  },

  refreshConfigCache: async () => {
    const { data } = await client.post<{ data: { success: boolean } }>("/admin/config/refresh");
    return data.data;
  },
});
