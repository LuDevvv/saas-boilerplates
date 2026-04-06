import { BaseService } from "../baseService";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  role: "owner" | "admin" | "member";
  plan: "free" | "pro" | "enterprise";
}

class WorkspaceService extends BaseService {
  constructor() {
    super("/workspaces");
  }

  async getAll(): Promise<Workspace[]> {
    return this.get<Workspace[]>("/", "workspaces.json");
  }

  async create(data: { name: string }): Promise<Workspace> {
    return this.post<Workspace>("/", data);
  }

  async update(id: string, data: Partial<Workspace>): Promise<Workspace> {
    return this.put<Workspace>(`/${id}`, data);
  }

  async removeWorkspace(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  // Logo management will usually be handled via StorageService 
  // but we can expose legacy wrappers or verification helpers here.
  async deleteLogo(id: string): Promise<Workspace> {
    return this.post<Workspace>(`/${id}/logo/delete`);
  }
}

export const workspaceService = new WorkspaceService();
