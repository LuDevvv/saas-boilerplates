import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { appToast } from "@/components/alerts/Toasts";
import type { CreateWorkspaceDto, UpdateWorkspaceDto, Workspace } from "@node-stack/types";

export const useWorkspaces = () => {
  const query = useQuery({
    queryKey: queryKeys.workspaces.list(),
    queryFn: () => api.workspace.list(),
  });

  return {
    ...query,
    data: (query.data as any)?.workspaces ?? query.data ?? [],
  };
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<Workspace, Error, CreateWorkspaceDto>({
    mutationFn: (data) => api.workspace.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.list() });
      appToast.success({ title: "Compañía creada", description: "La nueva compañía está lista para usarse." });
    },
    onError: (err) => appToast.error(err),
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<Workspace, Error, { workspaceId: string; data: UpdateWorkspaceDto }>({
    mutationFn: ({ workspaceId, data }) =>
      api.workspace.update(workspaceId, data).then((r) => r.data),
    onMutate: async ({ workspaceId, data: newData }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.workspaces.list() });
      const previousWorkspaces = queryClient.getQueryData(queryKeys.workspaces.list());

      queryClient.setQueryData(queryKeys.workspaces.list(), (old: any) => {
        const list = (old as any)?.workspaces ?? old ?? [];
        return {
          ...old,
          workspaces: list.map((w: Workspace) => w.id === workspaceId ? { ...w, ...newData } : w)
        };
      });

      return { previousWorkspaces };
    },
    onError: (err, _, context: any) => {
      queryClient.setQueryData(queryKeys.workspaces.list(), context?.previousWorkspaces);
      appToast.error(err);
    },
    onSuccess: () => {
      appToast.success({ title: "Cambios guardados", description: "La información de la compañía ha sido actualizada." });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.list() });
    },
  });
};
