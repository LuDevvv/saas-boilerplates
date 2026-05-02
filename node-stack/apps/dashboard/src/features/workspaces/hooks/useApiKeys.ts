import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { apiKeysApi } from "../api/api-keys.api";
import { appToast } from "@/components/alerts/Toasts";

export const useApiKeys = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? [...queryKeys.all, "workspaces", workspaceId, "api-keys"] : [],
    queryFn: () => apiKeysApi.getApiKeys(workspaceId!),
    enabled: !!workspaceId,
  });
};

export const useCreateApiKey = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => apiKeysApi.createApiKey(workspaceId!, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.all, "workspaces", workspaceId!, "api-keys"] });
      appToast.success({ title: "Clave API creada", description: "La nueva clave ha sido generada correctamente." });
    },
    onError: () => {
      appToast.error({ title: "Error", description: "No se pudo crear la clave API." });
    },
  });
};

export const useRevokeApiKey = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) => apiKeysApi.revokeApiKey(workspaceId!, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.all, "workspaces", workspaceId!, "api-keys"] });
      appToast.success({ title: "Clave API revocada", description: "La clave ya no podrá ser utilizada." });
    },
  });
};
