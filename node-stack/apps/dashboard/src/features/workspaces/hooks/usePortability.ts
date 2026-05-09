import type { ExportDownloadResponse } from "@node-stack/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { appToast } from "@/components/alerts/Toasts";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";

export const usePortabilityRequests = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? [...queryKeys.all, "workspaces", workspaceId, "portability"] : [],
    queryFn: () => api.portability.listRequests(workspaceId!),
    enabled: !!workspaceId,
  });
};

export const useRequestExport = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.portability.requestExport(workspaceId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.all, "workspaces", workspaceId!, "portability"] });
      appToast.success({ 
        title: "Exportación iniciada", 
        description: "Se ha encolado la exportación de datos. Te notificaremos cuando esté lista." 
      });
    },
    onError: () => {
      appToast.error({ title: "Error", description: "No se pudo solicitar la exportación." });
    },
  });
};

export const useDownloadExport = (workspaceId: string | null) => {
  return useMutation<ExportDownloadResponse, Error, string>({
    mutationFn: (requestId: string) => api.portability.getDownloadUrl(workspaceId!, requestId),
    onSuccess: (data) => {
      window.open(data.downloadUrl, "_blank");
    },
    onError: () => {
      appToast.error({ title: "Error", description: "No se pudo obtener el enlace de descarga." });
    },
  });
};
