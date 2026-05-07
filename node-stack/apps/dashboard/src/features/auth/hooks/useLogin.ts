import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LoginDto, AuthResponse } from "@node-stack/types";

export const useLogin = () => {
  return useMutation<AuthResponse, Error, LoginDto>({
    mutationFn: (credentials) => api.auth.login(credentials),
  });
};