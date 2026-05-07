import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useReports = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? ["reports", workspaceId] : [],
    queryFn: () => api.storage.listFiles(workspaceId!),
    enabled: !!workspaceId,
  });
};

export const useDeleteReport = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.storage.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", workspaceId] });
    },
  });
};
