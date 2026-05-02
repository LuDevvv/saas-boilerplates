import { apiClient } from "@/lib/api";

export interface PortabilityRequest {
  id: string;
  workspaceId: string;
  userId: string;
  status: "pending" | "processing" | "completed" | "failed";
  requestedAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

export const portabilityApi = {
  getRequests: (workspaceId: string): Promise<PortabilityRequest[]> =>
    apiClient.get(`/workspaces/${workspaceId}/portability`),

  getRequestById: (workspaceId: string, requestId: string): Promise<PortabilityRequest> =>
    apiClient.get(`/workspaces/${workspaceId}/portability/${requestId}`),

  createRequest: (workspaceId: string): Promise<PortabilityRequest> =>
    apiClient.post(`/workspaces/${workspaceId}/portability`, {}),

  getDownloadUrl: (workspaceId: string, requestId: string): Promise<{ url: string }> =>
    apiClient.get(`/workspaces/${workspaceId}/portability/${requestId}/download`),
};