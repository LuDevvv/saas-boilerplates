import { BaseService } from "../BaseService";

export interface WorkspaceItem {
  id: string;
  name: string;
  location: string;
  status: "active" | "idle" | "error";
  members: number;
  lastActive: string;
}

export interface WorkspaceUsage {
  label: string;
  used: number;
  total: number;
  unit: string;
  color: string;
}

class WorkspaceService extends BaseService {
  constructor() {
    super("workspaces");
  }

  async getWorkspaces(): Promise<any> {
    return this.handleRequest<any>(async () => {
      // For now, the UI uses localStorage directly for demo purposes
      throw new Error("Real API not implemented yet");
    });
  }

  async getWorkspaceById(id: string): Promise<WorkspaceItem | undefined> {
    const stored = localStorage.getItem('dash_workspaces');
    if (!stored) return undefined;
    const workspaces: WorkspaceItem[] = JSON.parse(stored);
    return workspaces.find(ws => ws.id === id);
  }

  async updateWorkspace(id: string, updates: Partial<WorkspaceItem>): Promise<WorkspaceItem> {
    const stored = localStorage.getItem('dash_workspaces');
    if (!stored) throw new Error("No workspaces found");
    const workspaces: WorkspaceItem[] = JSON.parse(stored);
    const updated = workspaces.map(ws => ws.id === id ? { ...ws, ...updates } : ws);
    localStorage.setItem('dash_workspaces', JSON.stringify(updated));
    const result = updated.find(ws => ws.id === id);
    if (!result) throw new Error("Workspace not found");
    return result;
  }

  async getUsage(workspaceId: string): Promise<WorkspaceUsage[]> {
    console.log("Fetching usage for workspace:", workspaceId);
    return [
      { label: "API Requests", used: 28500, total: 50000, unit: "calls", color: "indigo" },
      { label: "Storage", used: 7.4, total: 10, unit: "GB", color: "sky" },
      { label: "AI Tokens", used: 120000, total: 1000000, unit: "tkns", color: "violet" },
    ];
  }
}

export const workspaceService = new WorkspaceService();
