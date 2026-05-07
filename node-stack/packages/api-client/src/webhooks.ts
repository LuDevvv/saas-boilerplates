import { AxiosInstance } from "axios";
import { WebhookLog, PaginatedResponse } from "@node-stack/types";

export const webhooks = (client: AxiosInstance) => ({
  getRecentLogs: async (params?: { provider?: string; limit?: number }) => {
    const { data } = await client.get<WebhookLog[]>("/webhooks/logs/recent", { params });
    return data;
  },

  getFailedLogs: async (params?: { provider?: string; limit?: number }) => {
    const { data } = await client.get<WebhookLog[]>("/webhooks/logs/failed", { params });
    return data;
  },

  getLogById: async (id: string) => {
    const { data } = await client.get<WebhookLog>(`/webhooks/logs/${id}`);
    return data;
  },

  getProviders: async () => {
    const { data } = await client.get<{ providers: string[] }>("/webhooks/providers");
    return data.providers;
  },
});
