import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { adminApi, type SystemStats, type AdminUser, type AuditLog, type FeatureFlag } from "../api/admin.api";

export const useAdminStats = () => {
  return useQuery<SystemStats, Error>({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => adminApi.getStats(),
  });
};

export const useAdminUsers = () => {
  return useQuery<AdminUser[], Error>({
    queryKey: queryKeys.admin.users(),
    queryFn: () => adminApi.getUsers(),
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      adminApi.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });
};

export const useFeatureFlags = () => {
  return useQuery<FeatureFlag[], Error>({
    queryKey: queryKeys.admin.featureFlags(),
    queryFn: () => adminApi.getFeatureFlags(),
  });
};

export const useToggleFeatureFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flagId, enabled }: { flagId: string; enabled: boolean }) =>
      adminApi.toggleFeatureFlag(flagId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.featureFlags() });
    },
  });
};

export const useAuditLogs = () => {
  return useQuery<AuditLog[], Error>({
    queryKey: queryKeys.admin.auditLogs(),
    queryFn: () => adminApi.getAuditLogs(),
  });
};