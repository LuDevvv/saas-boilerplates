import { useQuery } from "@tanstack/react-query";
import { workspacesApi } from "../api/workspaces.api";
import { queryKeys } from "@/lib/react-query/queryKeys";

export const useWorkspaceUsage = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? queryKeys.workspaces.usage(workspaceId) : [],
    queryFn: () => workspacesApi.getUsage(workspaceId!),
    enabled: !!workspaceId,
  });
};
