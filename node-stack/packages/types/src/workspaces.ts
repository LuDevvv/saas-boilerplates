import { UserEntity } from "./auth.js";
export interface CreateWorkspaceDto {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
  logoUrl?: string;
}

export interface InviteMemberDto {
  email: string;
  role: "admin" | "member" | "guest";
}

export interface UpdateMemberRoleDto {
  role: "admin" | "member" | "guest";
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: "owner" | "admin" | "member" | "guest";
  user: UserEntity;
  createdAt: string;
}

export interface InviteMemberResponse {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string | null;
}
