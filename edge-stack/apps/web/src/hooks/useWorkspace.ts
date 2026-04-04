import { useWorkspaceStore } from "../stores/useWorkspaceStore";
import { useUserStore } from "../stores/useUserStore";

/**
 * useWorkspace Hook.
 * Bridge between the components and the workspace store.
 * Provides a clean interface for workspace interactions.
 */
export function useWorkspace() {
  const {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    isOrg,
    switchWorkspace,
  } = useWorkspaceStore();

  return {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    isOrg,
    switchWorkspace,
  };
}
