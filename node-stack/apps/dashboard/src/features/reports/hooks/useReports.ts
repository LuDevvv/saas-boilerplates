import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storageApi } from "../../storage/api/storage.api";

export const useReports = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? ["reports", workspaceId] : [],
    queryFn: () => storageApi.listFiles(workspaceId!),
    enabled: !!workspaceId,
  });
};

export const useDeleteReport = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storageApi.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", workspaceId] });
    },
  });
};
