import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { appToast } from "@/components/alerts/Toasts";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";

export const useApiKeys = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? [...queryKeys.all, "workspaces", workspaceId, "api-keys"] : [],
    queryFn: () => api.workspace.listApiKeys(workspaceId!).then((r) => r.data),
    enabled: !!workspaceId,
  });
};

export const useCreateApiKey = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) =>
      api.workspace.createApiKey(workspaceId!, { name }).then((r) => r.data),
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
  const queryKey = workspaceId ? [...queryKeys.all, "workspaces", workspaceId, "api-keys"] : [];

  return useMutation({
    mutationFn: (keyId: string) =>
      api.workspace.revokeApiKey(workspaceId!, keyId).then((r) => r.data),
    onMutate: async (keyId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousKeys = queryClient.getQueryData(queryKey);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(queryKey, (old: any) => {
        const keys = Array.isArray(old) ? old : old?.data || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return keys.filter((k: any) => k.id !== keyId);
      });

      return { previousKeys };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(queryKey, context?.previousKeys);
      appToast.error(err);
    },
    onSuccess: () => {
      appToast.success({ title: "Clave API revocada", description: "La clave ya no podrá ser utilizada." });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
