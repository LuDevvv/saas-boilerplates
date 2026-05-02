import { apiClient } from "@/lib/api";

export interface WorkspaceItem {
  id: string;
  name: string;
  location: string;
  status: "active" | "idle" | "error";
  members: number;
  lastActive: string;
  logoUrl?: string | null;
}

export interface WorkspaceUsage {
  label: string;
  used: number;
  total: number;
  unit: string;
  color: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: "owner" | "admin" | "member" | "guest";
  user: {
    id: string;
    email: string;
    name: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
  status: "active" | "pending" | "declined";
  createdAt: string;
}

export interface InviteMemberRequest {
  email: string;
  role: "admin" | "member" | "guest";
  message?: string;
}

export const workspacesApi = {
  getWorkspaces: (): Promise<WorkspaceItem[]> => 
    apiClient.get("/workspaces"),

  getWorkspace: (id: string): Promise<WorkspaceItem> => 
    apiClient.get(`/workspaces/${id}`),

  createWorkspace: (data: Partial<WorkspaceItem>): Promise<WorkspaceItem> => 
    apiClient.post("/workspaces", data),

  updateWorkspace: (id: string, data: Partial<WorkspaceItem>): Promise<WorkspaceItem> => 
    apiClient.patch(`/workspaces/${id}`, data),

  deleteWorkspace: (id: string): Promise<void> => 
    apiClient.delete(`/workspaces/${id}`),

  getUsage: (id: string): Promise<WorkspaceUsage[]> => 
    apiClient.get(`/workspaces/${id}/usage`),

  getMembers: (workspaceId: string): Promise<WorkspaceMember[]> =>
    apiClient.get(`/workspaces/${workspaceId}/members`),

  inviteMember: (workspaceId: string, data: InviteMemberRequest): Promise<void> =>
    apiClient.post(`/workspaces/${workspaceId}/members/invite`, data),

  updateMemberRole: (workspaceId: string, memberId: string, role: string): Promise<void> =>
    apiClient.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role }),

  removeMember: (workspaceId: string, memberId: string): Promise<void> =>
    apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`),
};
