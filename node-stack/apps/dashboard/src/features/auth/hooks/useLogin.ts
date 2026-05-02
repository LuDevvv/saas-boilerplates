import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import type { LoginDto } from "@node-stack/types";
import type { AuthResponse } from "../api/types";

export const useLogin = () => {
  return useMutation<AuthResponse, Error, LoginDto>({
    mutationFn: (credentials) => authApi.login(credentials),
  });
};