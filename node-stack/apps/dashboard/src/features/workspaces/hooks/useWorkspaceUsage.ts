import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";

export const useWorkspaceUsage = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? queryKeys.workspaces.usage(workspaceId) : [],
    queryFn: () => api.workspace.get(workspaceId!),
    enabled: !!workspaceId,
  });
};
