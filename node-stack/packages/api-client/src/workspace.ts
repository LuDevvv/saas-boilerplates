import { AxiosInstance } from "axios";
import { createClient } from "./client";
import { z } from "zod";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  domain: string | null;
  createdAt: string;
  updatedAt: string;
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
  };
  createdAt: string;
}

export interface InviteMemberRequest {
  email: string;
  role: "admin" | "member" | "guest";
  message?: string;
}

export interface InviteMemberResponse {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
}

const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
});

const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  logo: z.string().nullable().optional(),
  domain: z.string().nullable().optional(),
});

const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "guest"]),
  message: z.string().optional(),
});

export const workspace = (client: AxiosInstance) => ({
  list: async (params?: { page?: number; limit?: number }) => {
    return await client.get<{ data: Workspace[]; meta: { page: number; limit: number; total: number } }>("/workspaces", { params });
  },

  get: async (workspaceId: string) => {
    return await client.get<{ data: Workspace }>(`/workspaces/${workspaceId}`);
  },

  create: async (body: { name: string; slug: string }) => {
    return await client.post<{ data: Workspace }>("/workspaces", CreateWorkspaceSchema.parse(body));
  },

  update: async (workspaceId: string, body: { name?: string; logo?: string | null; domain?: string | null }) => {
    return await client.patch<{ data: Workspace }>(`/workspaces/${workspaceId}`, UpdateWorkspaceSchema.parse(body));
  },

  delete: async (workspaceId: string) => {
    return await client.delete<{ success: boolean }>(`/workspaces/${workspaceId}`);
  },

  listMembers: async (workspaceId: string, params?: { page?: number; limit?: number }) => {
    return await client.get<{ data: WorkspaceMember[]; meta: { page: number; limit: number; total: number } }>(`/workspaces/${workspaceId}/members`, { params });
  },

  inviteMember: async (workspaceId: string, body: { email: string; role: "admin" | "member" | "guest"; message?: string }) => {
    return await client.post<{ data: InviteMemberResponse }>(`/workspaces/${workspaceId}/members/invite`, InviteMemberSchema.parse(body));
  },

  removeMember: async (workspaceId: string, memberId: string) => {
    return await client.delete<{ success: boolean }>(`/workspaces/${workspaceId}/members/${memberId}`);
  },

  updateMemberRole: async (workspaceId: string, memberId: string, body: { role: "admin" | "member" | "guest" }) => {
    return await client.patch<{ data: WorkspaceMember }>(`/workspaces/${workspaceId}/members/${memberId}`, body);
  },
});
