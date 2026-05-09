import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { appToast } from "@/components/alerts/Toasts";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";

export const useWebhooks = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? [...queryKeys.all, "workspaces", workspaceId, "webhooks"] : [],
    queryFn: () => api.workspace.listWebhooks(workspaceId!).then((r) => r.data),
    enabled: !!workspaceId,
  });
};

export const useCreateWebhook = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutation<any, Error, { url: string; eventTypes: string[] }>({
    mutationFn: ({ url, eventTypes }) =>
      api.workspace.createWebhook(workspaceId!, { url, eventTypes }).then((r) => r.data),
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
    mutationFn: (id) =>
      api.workspace.deleteWebhook(workspaceId!, id).then((r) => r.data?.success ?? false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.all, "workspaces", workspaceId!, "webhooks"] });
      appToast.success({ title: "Webhook eliminado", description: "El endpoint ha sido removido." });
    },
  });
};

export const useUpdateWebhook = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutation<any, Error, { id: string; url?: string; eventTypes?: string[]; enabled?: boolean }>({
    mutationFn: ({ id, ...data }) =>
      api.workspace.updateWebhook(workspaceId!, id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.all, "workspaces", workspaceId!, "webhooks"] });
      appToast.success({ title: "Webhook actualizado", description: "El endpoint ha sido modificado correctamente." });
    },
    onError: () => {
      appToast.error({ title: "Error", description: "No se pudo actualizar el webhook." });
    },
  });
};
