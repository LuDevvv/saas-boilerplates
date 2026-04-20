import { create } from "zustand";
import { workspaceService, WorkspaceUsage } from "@/services/workspaces/workspaceService";

interface WorkspaceState {
  activeWorkspaceId: string | null;
  usage: WorkspaceUsage[];
  loading: boolean;
  error: string | null;

  setActiveWorkspace: (id: string) => void;
  fetchUsage: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeWorkspaceId: "default-workspace", // Mock default
  usage: [],
  loading: false,
  error: null,

  setActiveWorkspace: (id: string) => {
    set({ activeWorkspaceId: id });
    get().fetchUsage();
  },

  fetchUsage: async () => {
    const { activeWorkspaceId } = get();
    if (!activeWorkspaceId) return;

    set({ loading: true, error: null });
    try {
      const usage = await workspaceService.getUsage(activeWorkspaceId);
      set({ usage, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
