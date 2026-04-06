import { useWorkspaceStore } from "@/stores/workspaceStore";

export const useWorkspace = () => {
  const {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspaceId,
    fetchWorkspaces,
    loading,
  } = useWorkspaceStore();

  return {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspaceId,
    fetchWorkspaces,
    loading,
  };
};