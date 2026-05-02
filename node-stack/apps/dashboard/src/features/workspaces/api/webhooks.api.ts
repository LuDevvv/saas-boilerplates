import { apiClient } from "@/lib/api";

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  enabled: boolean;
  eventTypes: string[];
  workspaceId: string;
  createdAt: string;
}

export const webhooksApi = {
  getWebhooks: (workspaceId: string): Promise<WebhookEndpoint[]> =>
    apiClient.get(`/workspaces/${workspaceId}/webhooks`),

  createWebhook: (workspaceId: string, url: string, eventTypes: string[]): Promise<WebhookEndpoint> =>
    apiClient.post(`/workspaces/${workspaceId}/webhooks`, { url, eventTypes }),

  updateWebhook: (id: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> =>
    apiClient.put(`/webhooks/${id}`, updates),

  deleteWebhook: (id: string): Promise<void> =>
    apiClient.delete(`/webhooks/${id}`),
};