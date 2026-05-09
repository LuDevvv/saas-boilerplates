import { AxiosInstance } from "axios";
import { AnalyticsOverview, TrafficData, PageStat, UsageData } from "@node-stack/types";

export const analytics = (client: AxiosInstance) => ({
  getOverview: async (workspaceId: string) => {
    return client.get<AnalyticsOverview>(
      `/analytics/workspaces/${workspaceId}/overview`,
    ) as unknown as Promise<AnalyticsOverview>;
  },

  getTraffic: async (workspaceId: string) => {
    return client.get<TrafficData[]>(
      `/analytics/workspaces/${workspaceId}/traffic`,
    ) as unknown as Promise<TrafficData[]>;
  },

  getPages: async (workspaceId: string) => {
    return client.get<PageStat[]>(`/analytics/workspaces/${workspaceId}/pages`) as unknown as Promise<PageStat[]>;
  },

  getUsage: async (workspaceId: string) => {
    return client.get<UsageData>(`/analytics/workspaces/${workspaceId}/usage`) as unknown as Promise<UsageData>;
  },

  getGlobalAdminStats: async () => {
    return client.get<any>("/analytics/admin/global-stats") as unknown as Promise<any>;
  },
});
