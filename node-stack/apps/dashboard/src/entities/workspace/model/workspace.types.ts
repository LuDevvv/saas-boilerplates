export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor?: string;
  settings: WorkspaceSettings;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  currency: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: "owner" | "admin" | "member" | "viewer";
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  joinedAt: string;
}

export interface WorkspaceUsage {
  workspaceId: string;
  storageUsed: number;
  storageLimit: number;
  apiCalls: number;
  apiLimit: number;
  membersCount: number;
  membersLimit: number;
  period: string;
}