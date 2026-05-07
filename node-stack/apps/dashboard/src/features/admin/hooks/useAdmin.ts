import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { api } from "@/lib/api";
import type { SystemStats, AdminUser, AuditLog, FeatureFlag } from "@node-stack/types";

export const useAdminStats = () => {
  return useQuery<SystemStats, Error>({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => api.admin.getStats(),
  });
};

export const useAdminUsers = () => {
  return useQuery<AdminUser[], Error>({
    queryKey: queryKeys.admin.users(),
    queryFn: async () => {
      const response = await api.admin.listUsers();
      return (response as any)?.data ?? response;
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      api.admin.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.admin.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });
};

export const useFeatureFlags = () => {
  return useQuery<FeatureFlag[], Error>({
    queryKey: queryKeys.admin.featureFlags(),
    queryFn: () => api.admin.getFeatureFlags(),
  });
};

export const useToggleFeatureFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flagId, enabled }: { flagId: string; enabled: boolean }) =>
      api.admin.toggleFeatureFlag(flagId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.featureFlags() });
    },
  });
};

export const useAuditLogs = () => {
  return useQuery<AuditLog[], Error>({
    queryKey: queryKeys.admin.auditLogs(),
    queryFn: () => api.admin.getAuditLogs(),
  });
};