import type { LoginDto, RegisterDto, AuthResponse, VerifyEmailDto } from "@node-stack/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { api, cookieTokenStorage } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useAuthStore } from "@/stores/authStore";

export const useLogin = () => {
  const setAuth = useAuthStore(useShallow((state) => state.setAuth));
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginDto>({
    mutationFn: (credentials) => api.auth.login(credentials),
    onSuccess: ({ accessToken }) => {
      setAuth(accessToken);
      cookieTokenStorage.setToken(accessToken);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore(useShallow((state) => state.setAuth));
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, RegisterDto>({
    mutationFn: (userData) => api.auth.register(userData),
    onSuccess: ({ accessToken }) => {
      setAuth(accessToken);
      cookieTokenStorage.setToken(accessToken);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};

export const useRequestPasswordReset = () => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (email) => api.auth.forgotPassword({ email }),
  });
};

export const useResetPassword = () => {
  return useMutation<{ message: string }, Error, { token: string; password: string }>({
    mutationFn: ({ token, password }) => api.auth.resetPassword({ token, newPassword: password }),
  });
};

export const useLogout = () => {
  const clearStore = useAuthStore(useShallow((state) => state.logout));
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.auth.logout(),
    onSettled: () => {
      clearStore();
      cookieTokenStorage.removeToken();
      queryClient.clear();
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation<{ message: string }, Error, VerifyEmailDto>({
    mutationFn: (data) => api.auth.verifyEmail(data),
  });
};

export const useResendVerification = () => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: () => api.auth.sendVerificationEmail(),
  });
};