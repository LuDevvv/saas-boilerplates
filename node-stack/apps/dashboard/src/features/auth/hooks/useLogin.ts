import type { LoginDto, AuthResponse } from "@node-stack/types";
import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api";

export const useLogin = () => {
  return useMutation<AuthResponse, Error, LoginDto>({
    mutationFn: (credentials) => api.auth.login(credentials),
  });
};