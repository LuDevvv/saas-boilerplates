import { AxiosInstance } from "axios";
import { WebhookLog, PaginatedResponse } from "@node-stack/types";

export const webhooks = (client: AxiosInstance) => ({
  getRecentLogs: async (params?: { provider?: string; limit?: number }) => {
    return client.get<WebhookLog[]>("/webhooks/logs/recent", { params });
  },

  getFailedLogs: async (params?: { provider?: string; limit?: number }) => {
    return client.get<WebhookLog[]>("/webhooks/logs/failed", { params });
  },

  getLogById: async (id: string) => {
    return client.get<WebhookLog>(`/webhooks/logs/${id}`);
  },

  getProviders: async () => {
    const response = await client.get<{ providers: string[] }>(
      "/webhooks/providers",
    );
    return (response as any).providers;
  },
});