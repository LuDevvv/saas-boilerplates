import { AxiosInstance } from "axios";
import { AnalyticsOverview, TrafficData, PageStat, UsageData } from "@node-stack/types";

export const analytics = (client: AxiosInstance) => ({
  getOverview: async (workspaceId: string) => {
    const { data } = await client.get<{ data: AnalyticsOverview }>(`/analytics/workspaces/${workspaceId}/overview`);
    return data.data;
  },

  getTraffic: async (workspaceId: string) => {
    const { data } = await client.get<{ data: TrafficData[] }>(`/analytics/workspaces/${workspaceId}/traffic`);
    return data.data;
  },

  getPages: async (workspaceId: string) => {
    const { data } = await client.get<{ data: PageStat[] }>(`/analytics/workspaces/${workspaceId}/pages`);
    return data.data;
  },

  getUsage: async (workspaceId: string) => {
    const { data } = await client.get<{ data: UsageData }>(`/analytics/workspaces/${workspaceId}/usage`);
    return data.data;
  },

  getGlobalAdminStats: async () => {
    const { data } = await client.get<{ data: any }>("/analytics/admin/global-stats");
    return data.data;
  },
});
