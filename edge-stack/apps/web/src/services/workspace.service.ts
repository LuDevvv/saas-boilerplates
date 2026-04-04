import { client } from "../lib/api";
import type { IWorkspace } from "../types";

/**
 * Workspace Management Service.
 * Pure service layer for communicating with the workspace endpoints.
 */
export const workspaceService = {
  /**
   * Fetches all workspaces for the current user.
   */
  async listWorkspaces() {
    // Typically these are included in the profile,
    // but this could be a separate call if needed.
    const userApi = client.api.users.me as any;
    const res = await userApi.$get();
    if (res.ok) {
      const data = await res.json();
      return data.data.workspaces || [];
    }
    return [];
  },

  /**
   * Fetches details for a specific workspace.
   */
  async getWorkspace(id: string) {
    // Implementation for getting workspace details
  },
};
