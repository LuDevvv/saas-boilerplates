import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { api } from "@/lib/api";
import { appToast } from "@/components/alerts/Toasts";
import type { InviteMemberDto, UpdateMemberRoleDto, WorkspaceMember } from "@node-stack/types";

export const useWorkspaceMembers = (workspaceId: string | null) => {
  const query = useQuery({
    queryKey: workspaceId ? queryKeys.workspaces.members(workspaceId) : [],
    queryFn: () => api.workspace.listMembers(workspaceId!),
    enabled: !!workspaceId,
  });

  return {
    ...query,
    data: ((query.data as any)?.data ?? query.data ?? []) as WorkspaceMember[],
  };
};

export const useInviteMember = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, InviteMemberDto>({
    mutationFn: (data) => api.workspace.inviteMember(workspaceId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId!) });
      appToast.success({ title: "Invitación enviada", description: "El usuario recibirá un correo para unirse." });
    },
    onError: () => {
      appToast.error({ title: "Error", description: "No se pudo enviar la invitación." });
    },
  });
};

export const useUpdateMemberRole = (workspaceId: string | null) => {
  const queryClient = useQueryClient();
  const queryKey = workspaceId ? [...queryKeys.all, "workspaces", workspaceId, "members"] : [];

  return useMutation<any, Error, { memberId: string; role: UpdateMemberRoleDto["role"] }>({
    mutationFn: ({ memberId, role }) =>
      api.workspace.updateMemberRole(workspaceId!, memberId, { role }),
    onMutate: async ({ memberId, role }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousMembers = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        const members = Array.isArray(old) ? old : old?.data || [];
        return members.map((m: any) => m.id === memberId ? { ...m, role } : m);
      });

      return { previousMembers };
    },
    onError: (err, _, context: any) => {
      queryClient.setQueryData(queryKey, context?.previousMembers);
      appToast.error(err);
    },
    onSuccess: () => {
      appToast.success({ title: "Rol actualizado", description: "El permiso del miembro ha sido modificado." });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useRemoveMember = (workspaceId: string | null) => {
  const queryClient = useQueryClient();
  const queryKey = workspaceId ? [...queryKeys.all, "workspaces", workspaceId, "members"] : [];

  return useMutation({
    mutationFn: (memberId: string) => api.workspace.removeMember(workspaceId!, memberId),
    onMutate: async (memberId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousMembers = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        const members = Array.isArray(old) ? old : old?.data || [];
        return members.filter((m: any) => m.id !== memberId);
      });

      return { previousMembers };
    },
    onError: (err, _, context: any) => {
      queryClient.setQueryData(queryKey, context?.previousMembers);
      appToast.error(err);
    },
    onSuccess: () => {
      appToast.success({ title: "Miembro eliminado", description: "El usuario ya no tiene acceso al espacio." });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
