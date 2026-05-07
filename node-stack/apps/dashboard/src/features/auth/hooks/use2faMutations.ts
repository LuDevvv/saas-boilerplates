import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import type { Verify2faDto } from "@node-stack/types";

export const useEnable2fa = () => {
  return useMutation({
    mutationFn: () => api.auth.enable2fa(),
  });
};

export const useVerify2fa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Verify2faDto) => api.auth.verify2fa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};

export const useDisable2fa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.auth.disable2fa(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};
