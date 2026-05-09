import type { AdminStats, AdminTrends } from "@node-stack/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { appToast } from "@/components/alerts/Toasts";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";

export const useAdminStats = () => {
  return useQuery<AdminStats, Error>({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => api.admin.getStats(),
    staleTime: 30_000,
  });
};

export const useAdminTrends = (days?: number) => {
  return useQuery<AdminTrends, Error>({
    queryKey: [...queryKeys.admin.stats(), "trends", days ?? 30],
    queryFn: () => api.admin.getTrends(days),
    staleTime: 60_000,
  });
};

export const useAdminUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: [...queryKeys.admin.users(), params],
    queryFn: async () => {
      const response = await api.admin.listUsers(params);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response as any)?.data ?? response ?? [];
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      status,
      reason,
    }: {
      userId: string;
      status: "active" | "suspended" | "banned";
      reason?: string;
    }) => api.admin.updateUserStatus(userId, status, reason),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      const label = status === "active" ? "reactivado" : status === "suspended" ? "suspendido" : "baneado";
      appToast.success({ title: "Usuario actualizado", description: `El usuario fue ${label} correctamente.` });
    },
    onError: () => {
      appToast.error({ title: "Error", description: "No se pudo actualizar el estado del usuario." });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "user" | "admin" | "super_admin";
    }) => api.admin.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      appToast.success({ title: "Rol actualizado", description: "El cambio de rol invalida las sesiones activas del usuario." });
    },
    onError: () => {
      appToast.error({ title: "Error", description: "No se pudo actualizar el rol." });
    },
  });
};

export const useFeatureFlags = () => {
  return useQuery({
    queryKey: queryKeys.admin.featureFlags(),
    queryFn: () => api.admin.getFeatureFlags(),
  });
};

export const useToggleFeatureFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      flagKey,
      enabled,
      scope,
      workspaceId,
      userId,
    }: {
      flagKey: string;
      enabled: boolean;
      scope?: "global" | "workspace" | "user";
      workspaceId?: string;
      userId?: string;
    }) => api.admin.toggleFeatureFlag(flagKey, enabled, { scope, workspaceId, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.featureFlags() });
    },
  });
};

export const useAuditLogs = (params?: {
  page?: number;
  limit?: number;
  action?: string;
  userId?: string;
  workspaceId?: string;
  from?: string;
  to?: string;
}) => {
  return useQuery({
    queryKey: [...queryKeys.admin.auditLogs(), params],
    queryFn: () => api.admin.getAuditLogs(params),
  });
};

export const useAdminWorkspaces = (params?: {
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}) => {
  return useQuery({
    queryKey: ["admin", "workspaces", params],
    queryFn: () => api.admin.listWorkspaces(params),
  });
};

export const useImpersonateUser = () => {
  return useMutation({
    mutationFn: (userId: string) => api.admin.impersonateUser(userId),
    onSuccess: (tokens) => {
      appToast.success({
        title: "Sesión de impersonación iniciada",
        description: "Ahora estás actuando como ese usuario. Los tokens son válidos por 24h.",
      });
      return tokens;
    },
    onError: () => {
      appToast.error({ title: "Error", description: "No se pudo iniciar la sesión de impersonación." });
    },
  });
};
