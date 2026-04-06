import { create } from "zustand";
import { persist } from "zustand/middleware";
import { workspaceService, type Workspace } from "@/services/workspaces/workspaceService";
import { AsyncState, handleStoreError } from "@/utils/storeUtils";

interface WorkspaceState extends AsyncState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  activeWorkspace: Workspace | null;

  // Actions
  fetchWorkspaces: () => Promise<void>;
  setActiveWorkspaceId: (id: string, shouldReload?: boolean) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  clearWorkspaces: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,
      activeWorkspace: null,
      loading: false,
      error: null,

      fetchWorkspaces: async () => {
        set({ loading: true, error: null });
        try {
          const workspaces = await workspaceService.getAll();
          const { activeWorkspaceId } = get();

          let selectedWorkspace: Workspace | null = null;
          if (activeWorkspaceId) {
            selectedWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || null;
          }

          set({ workspaces, activeWorkspace: selectedWorkspace });

          // Auto-select if none selected
          if (workspaces.length > 0 && !selectedWorkspace) {
            const firstWorkspace = workspaces[0];
            if (firstWorkspace) {
              get().setActiveWorkspaceId(firstWorkspace.id, false);
            }
          }
        } catch (error) {
          set({ error: handleStoreError(error) });
        } finally {
          set({ loading: false });
        }
      },

      setActiveWorkspaceId: (id, shouldReload = true) => {
        const workspace = get().workspaces.find((w) => w.id === id) || null;
        set({ activeWorkspaceId: id, activeWorkspace: workspace });

        // Critical: Update localStorage manually for the Axios interceptor 
        // to ensure immediate next calls use the right ID
        localStorage.setItem("active_workspace_id", id);

        if (shouldReload) {
          // Trigger global refetch by reloading or through an event system
          window.location.reload();
        }
      },

      setWorkspaces: (workspaces) => {
        set({ workspaces });
      },

      clearWorkspaces: () => {
        set({ workspaces: [], activeWorkspaceId: null, activeWorkspace: null });
        localStorage.removeItem("active_workspace_id");
      },
    }),
    {
      name: "workspace-storage",
      partialize: (state) => ({
        activeWorkspaceId: state.activeWorkspaceId,
        // We don't persist the whole list to keep it fresh
      }),
    }
  )
);
