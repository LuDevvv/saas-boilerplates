import { apiClient } from "@/shared/lib/api";

export interface AnalyticsOverview {
  totalVisits: { value: number; change: number; trend: "up" | "down" };
  activeSessions: { value: number; change: number; trend: "up" | "down" };
  bounceRate: { value: number; change: number; trend: "up" | "down" };
}

export interface TrafficData {
  date: string;
  count: number;
}

export interface PageStat {
  path: string;
  views: string;
  growth: string;
}

export interface UsageData {
  ai: {
    tokens: { input: number; output: number };
    history: Array<{ date: string; input: number; output: number }>;
  };
  storage: {
    used: number;
    total: number;
  };
  activity: {
    trend: Array<{ date: string; count: number }>;
  };
}

export const analyticsApi = {
  getOverview: (workspaceId: string): Promise<AnalyticsOverview> =>
    apiClient.get(`/analytics/workspaces/${workspaceId}/overview`),

  getTraffic: (workspaceId: string): Promise<TrafficData[]> =>
    apiClient.get(`/analytics/workspaces/${workspaceId}/traffic`),

  getPages: (workspaceId: string): Promise<PageStat[]> =>
    apiClient.get(`/analytics/workspaces/${workspaceId}/pages`),

  getUsage: (workspaceId: string): Promise<UsageData> =>
    apiClient.get(`/analytics/workspaces/${workspaceId}/usage`),

  getGlobalAdminStats: (): Promise<any> =>
    apiClient.get("/analytics/admin/global-stats"),
};
