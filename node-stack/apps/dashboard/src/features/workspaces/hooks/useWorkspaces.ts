import { useQuery } from "@tanstack/react-query";
import { workspacesApi } from "../api/workspaces.api";
import { queryKeys } from "@/lib/react-query/queryKeys";

export const useWorkspaces = () => {
  return useQuery({
    queryKey: queryKeys.workspaces.list(),
    queryFn: () => workspacesApi.getWorkspaces(),
  });
};
