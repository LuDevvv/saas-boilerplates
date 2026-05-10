import { 
  Workspace, 
  CreateWorkspaceDto, 
  UpdateWorkspaceDto, 
  InviteMemberDto, 
  UpdateMemberRoleDto,
  PaginatedResponse,
  WorkspaceMember,
  InviteMemberResponse
} from "@node-stack/types";
import { AxiosInstance } from "axios";

export const workspace = (client: AxiosInstance) => ({
  list: async (params?: { page?: number; limit?: number }) => {
    return client.get<PaginatedResponse<Workspace>>("/workspaces", { params });
  },

  get: async (workspaceId: string) => {
    return client.get<Workspace>(`/workspaces/${workspaceId}`);
  },

  create: async (data: CreateWorkspaceDto) => {
    return client.post<Workspace>("/workspaces", data);
  },

  update: async (workspaceId: string, data: UpdateWorkspaceDto) => {
    return client.patch<Workspace>(`/workspaces/${workspaceId}`, data);
  },

  delete: async (workspaceId: string) => {
    return client.delete<{ success: boolean }>(`/workspaces/${workspaceId}`);
  },

  listMembers: async (workspaceId: string, params?: { page?: number; limit?: number }) => {
    return client.get<PaginatedResponse<WorkspaceMember>>(`/workspaces/${workspaceId}/members`, { params });
  },

  inviteMember: async (workspaceId: string, data: InviteMemberDto) => {
    return client.post<InviteMemberResponse>(`/workspaces/${workspaceId}/invitations`, data);
  },

  listPendingInvitations: async () => {
    return client.get<any[]>("/workspace-invitations/pending");
  },

  listWorkspaceInvitations: async (workspaceId: string) => {
    return client.get<any[]>(`/workspaces/${workspaceId}/invitations`);
  },

  cancelInvitation: async (workspaceId: string, invitationId: string) => {
    return client.delete<{ message: string }>(`/workspaces/${workspaceId}/invitations/${invitationId}`);
  },

  acceptInvitation: async (token: string) => {
    return client.post<any>(`/workspace-invitations/${token}/accept`);
  },

  getInvitationDetails: async (token: string) => {
    return client.get<any>(`/workspace-invitations/${token}`);
  },

  removeMember: async (workspaceId: string, memberId: string) => {
    return client.delete<{ success: boolean }>(`/workspaces/${workspaceId}/members/${memberId}`);
  },

  updateMemberRole: async (workspaceId: string, memberId: string, data: UpdateMemberRoleDto) => {
    return client.patch<WorkspaceMember>(`/workspaces/${workspaceId}/members/${memberId}`, data);
  },

  // API Keys
  listApiKeys: async (workspaceId: string) => {
    return client.get<any[]>(`/workspaces/${workspaceId}/api-keys`);
  },

  createApiKey: async (workspaceId: string, data: { name: string; expiresAt?: string }) => {
    return client.post<any>(`/workspaces/${workspaceId}/api-keys`, data);
  },

  revokeApiKey: async (workspaceId: string, keyId: string) => {
    return client.delete<{ success: boolean }>(`/workspaces/${workspaceId}/api-keys/${keyId}`);
  },

  // Webhooks
  listWebhooks: async (workspaceId: string) => {
    return client.get<any[]>(`/workspaces/${workspaceId}/webhooks`);
  },

  createWebhook: async (workspaceId: string, data: { url: string; eventTypes: string[] }) => {
    return client.post<any>(`/workspaces/${workspaceId}/webhooks`, data);
  },

  deleteWebhook: async (workspaceId: string, webhookId: string) => {
    return client.delete<{ success: boolean }>(`/workspaces/${workspaceId}/webhooks/${webhookId}`);
  },

  updateWebhook: async (workspaceId: string, webhookId: string, data: { url?: string; eventTypes?: string[]; enabled?: boolean }) => {
    return client.patch<any>(`/workspaces/${workspaceId}/webhooks/${webhookId}`, data);
  },

  getWebhookDeliveries: async (workspaceId: string, webhookId: string) => {
    return client.get<any[]>(`/workspaces/${workspaceId}/webhooks/${webhookId}/deliveries`);
  },

  testWebhook: async (workspaceId: string, webhookId: string) => {
    return client.post<any>(`/workspaces/${workspaceId}/webhooks/${webhookId}/test`);
  },

  rotateWebhookSecret: async (workspaceId: string, webhookId: string) => {
    return client.post<any>(`/workspaces/${workspaceId}/webhooks/${webhookId}/rotate-secret`);
  },
});
