import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { webhooksApi, type WebhookEndpoint } from "../api/webhooks.api";
import { appToast } from "@/components/alerts/Toasts";

export const useWebhooks = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? [...queryKeys.all, "workspaces", workspaceId, "webhooks"] : [],
    queryFn: () => webhooksApi.getWebhooks(workspaceId!),
    enabled: !!workspaceId,
  });
};

export const useCreateWebhook = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, eventTypes }: { url: string; eventTypes: string[] }) => 
      webhooksApi.createWebhook(workspaceId!, url, eventTypes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.all, "workspaces", workspaceId!, "webhooks"] });
      appToast.success({ title: "Webhook creado", description: "El endpoint ha sido registrado correctamente." });
    },
    onError: () => {
      appToast.error({ title: "Error", description: "No se pudo crear el webhook." });
    },
  });
};

export const useUpdateWebhook = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WebhookEndpoint> }) =>
      webhooksApi.updateWebhook(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.all, "workspaces", workspaceId!, "webhooks"] });
      appToast.success({ title: "Webhook actualizado", description: "Los cambios han sido guardados." });
    },
  });
};

export const useDeleteWebhook = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => webhooksApi.deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.all, "workspaces", workspaceId!, "webhooks"] });
      appToast.success({ title: "Webhook eliminado", description: "El endpoint ha sido removido." });
    },
  });
};
