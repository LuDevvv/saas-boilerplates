import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { api } from "@/lib/api";
import { appToast } from "@/components/alerts/Toasts";

export const useWebhooks = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? [...queryKeys.all, "workspaces", workspaceId, "webhooks"] : [],
    queryFn: () => api.workspace.listWebhooks(workspaceId!),
    enabled: !!workspaceId,
  });
};

export const useCreateWebhook = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { url: string; eventTypes: string[] }>({
    mutationFn: ({ url, eventTypes }) => 
      api.workspace.createWebhook(workspaceId!, { url, eventTypes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.all, "workspaces", workspaceId!, "webhooks"] });
      appToast.success({ title: "Webhook creado", description: "El endpoint ha sido registrado correctamente." });
    },
    onError: () => {
      appToast.error({ title: "Error", description: "No se pudo crear the webhook." });
    },
  });
};

export const useDeleteWebhook = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: (id) => api.workspace.deleteWebhook(workspaceId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.all, "workspaces", workspaceId!, "webhooks"] });
      appToast.success({ title: "Webhook eliminado", description: "El endpoint ha sido removido." });
    },
  });
};

export const useUpdateWebhook = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; url?: string; eventTypes?: string[]; enabled?: boolean }>({
    mutationFn: ({ id, ...data }) =>
      api.workspace.updateWebhook(workspaceId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.all, "workspaces", workspaceId!, "webhooks"] });
      appToast.success({ title: "Webhook actualizado", description: "El endpoint ha sido modificado correctamente." });
    },
    onError: () => {
      appToast.error({ title: "Error", description: "No se pudo actualizar el webhook." });
    },
  });
};
