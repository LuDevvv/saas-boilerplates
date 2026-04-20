import type { Role } from "@node-stack/types";

export interface UserPayload {
  id: string;
  email: string;
  sessionId: string;
  workspaceRole?: Role;
}

export interface WorkspaceContext {
  id: string;
  name: string;
  role: Role;
  status: string;
}
