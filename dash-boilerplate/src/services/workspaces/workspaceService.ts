import { BaseService } from "../BaseService";

export interface WorkspaceItem {
  id: string;
  name: string;
  location: string;
  status: "active" | "idle" | "error";
  members: number;
  lastActive: string;
}

class WorkspaceService extends BaseService {
  constructor() {
    super("workspaces");
  }

  async getWorkspaces(): Promise<any> {
    return this.handleRequest<any>(async () => {
      throw new Error("Real API not implemented yet");
    });
  }
}

export const workspaceService = new WorkspaceService();
