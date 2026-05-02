import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/authStore";
import { cookieTokenStorage } from "@/lib/api";
import { useShallow } from "zustand/react/shallow";
import { queryKeys } from "@/lib/react-query/queryKeys";
import type { LoginDto, RegisterDto } from "@node-stack/types";

export const useLogin = () => {
  const setAuth = useAuthStore(useShallow((state) => state.setAuth));
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginDto) => authApi.login(credentials),
    onSuccess: ({ token }) => {
      setAuth(token);
      cookieTokenStorage.setToken(token);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore(useShallow((state) => state.setAuth));
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterDto) => authApi.register(userData),
    onSuccess: ({ token }) => {
      setAuth(token);
      cookieTokenStorage.setToken(token);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
  });
};

export const useLogout = () => {
  const clearStore = useAuthStore(useShallow((state) => state.logout));
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearStore();
      cookieTokenStorage.removeToken();
      queryClient.clear();
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.verifyEmail(email, code),
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerificationCode(email),
  });
};