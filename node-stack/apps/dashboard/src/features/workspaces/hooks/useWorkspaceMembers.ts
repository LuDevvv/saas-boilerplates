import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { workspacesApi, type InviteMemberRequest } from "../api/workspaces.api";
import { appToast } from "@/components/alerts/Toasts";

export const useWorkspaceMembers = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? queryKeys.workspaces.members(workspaceId) : [],
    queryFn: () => workspacesApi.getMembers(workspaceId!),
    enabled: !!workspaceId,
  });
};

export const useInviteMember = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteMemberRequest) => workspacesApi.inviteMember(workspaceId!, data),
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

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      workspacesApi.updateMemberRole(workspaceId!, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId!) });
      appToast.success({ title: "Rol actualizado", description: "El permiso del miembro ha sido modificado." });
    },
  });
};

export const useRemoveMember = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => workspacesApi.removeMember(workspaceId!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId!) });
      appToast.success({ title: "Miembro eliminado", description: "El usuario ya no tiene acceso al espacio." });
    },
  });
};
