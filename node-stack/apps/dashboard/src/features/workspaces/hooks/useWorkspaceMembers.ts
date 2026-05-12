import type { InviteMemberDto, UpdateMemberRoleDto, WorkspaceMember } from "@node-stack/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { appToast } from "@/components/alerts/Toasts";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";

// ─── Error helpers ────────────────────────────────────────────────────────────

const INVITE_ERROR_MAP: Record<string, string> = {
  "A pending invitation already exists": "Ya existe una invitación pendiente para este correo. Cancélala antes de reenviarla.",
  "User is already a member": "Este usuario ya es miembro del equipo.",
  "Not a member of this workspace": "No tienes acceso a este espacio.",
};

function parseInviteError(err: unknown): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiMsg: string = (err as any)?.response?.data?.message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?? (err as any)?.message
    ?? "";

  // Plan limit errors come through as ForbiddenException with Spanish text already
  if (apiMsg.toLowerCase().includes("plan") || apiMsg.toLowerCase().includes("límite")) {
    return apiMsg;
  }
  return INVITE_ERROR_MAP[apiMsg] ?? (apiMsg || "No se pudo enviar la invitación. Inténtalo de nuevo.");
}

export const useWorkspaceMembers = (workspaceId: string | null) => {
  const query = useQuery({
    queryKey: workspaceId ? queryKeys.workspaces.members(workspaceId) : [],
    queryFn: () => api.workspace.listMembers(workspaceId!),
    enabled: !!workspaceId,
  });

  return {
    ...query,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: ((query.data as any)?.data ?? query.data ?? []) as WorkspaceMember[],
  };
};

export const useInviteMember = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutation<any, unknown, InviteMemberDto>({
    mutationFn: (data) => api.workspace.inviteMember(workspaceId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId!) });
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "invitations"] });
      appToast.success({ title: "Invitación enviada", description: "El usuario recibirá un correo para unirse." });
    },
    // No onError toast — the modal shows the error inline to keep context.
    // The error propagates via mutateAsync so the modal's catch handles display.
  });
};

export const useWorkspaceInvitations = (workspaceId: string | null) => {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "invitations"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await api.workspace.listWorkspaceInvitations(workspaceId!) as any;
      return (Array.isArray(res) ? res : res?.data ?? []) as Array<{
        id: string; email: string; role: string; status: string;
        expiresAt: string; createdAt: string;
      }>;
    },
    enabled: !!workspaceId,
  });
};

export const useCancelInvitation = (workspaceId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      api.workspace.cancelInvitation(workspaceId!, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "invitations"] });
      appToast.success({ title: "Invitación cancelada", description: "El enlace de invitación ya no es válido." });
    },
    onError: (err) => {
      appToast.error({ title: "Error", description: parseInviteError(err) });
    },
  });
};

export const useUpdateMemberRole = (workspaceId: string | null) => {
  const queryClient = useQueryClient();
  const queryKey = workspaceId ? [...queryKeys.all, "workspaces", workspaceId, "members"] : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutation<any, Error, { memberId: string; role: UpdateMemberRoleDto["role"] }>({
    mutationFn: ({ memberId, role }) =>
      api.workspace.updateMemberRole(workspaceId!, memberId, { role }),
    onMutate: async ({ memberId, role }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousMembers = queryClient.getQueryData(queryKey);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(queryKey, (old: any) => {
        const members = Array.isArray(old) ? old : old?.data || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return members.map((m: any) => m.id === memberId ? { ...m, role } : m);
      });

      return { previousMembers };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(queryKey, (old: any) => {
        const members = Array.isArray(old) ? old : old?.data || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return members.filter((m: any) => m.id !== memberId);
      });

      return { previousMembers };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
