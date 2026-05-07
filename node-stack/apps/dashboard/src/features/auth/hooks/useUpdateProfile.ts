import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import type { UpdateProfileDto, UserEntity } from "@node-stack/types";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<UserEntity, Error, UpdateProfileDto>({
    mutationFn: (data) => api.auth.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};
