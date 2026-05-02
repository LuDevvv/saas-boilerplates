import { apiClient } from "@/lib/api";

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  secret?: string;
  lastUsedAt?: string;
  createdAt: string;
}

export const apiKeysApi = {
  ...{
    getApiKeys: (workspaceId: string): Promise<ApiKey[]> =>
      apiClient.get(`/workspaces/${workspaceId}/api-keys`),

    createApiKey: (workspaceId: string, name: string): Promise<ApiKey> =>
      apiClient.post(`/workspaces/${workspaceId}/api-keys`, { name }),

    revokeApiKey: (workspaceId: string, keyId: string): Promise<void> =>
      apiClient.delete(`/workspaces/${workspaceId}/api-keys/${keyId}`),
  },
};