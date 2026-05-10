import type { LoginDto, RegisterDto, AuthResponse, VerifyEmailDto } from "@node-stack/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { api, cookieTokenStorage } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useAuthStore } from "@/stores/authStore";

export const useLogin = () => {
  const setUser = useAuthStore(useShallow((state) => state.setUser));
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginDto>({
    mutationFn: (credentials) => api.auth.login(credentials),
    onSuccess: ({ accessToken, user }) => {
      setUser(user);
      cookieTokenStorage.setToken(accessToken);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};

export const useRegister = () => {
  const setUser = useAuthStore(useShallow((state) => state.setUser));
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, RegisterDto>({
    mutationFn: (userData) => api.auth.register(userData),
    onSuccess: ({ accessToken, user }) => {
      setUser(user);
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
  const clearUser = useAuthStore(useShallow((state) => state.clearUser));
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.auth.logout(),
    onSettled: () => {
      queryClient.clear();
      clearUser(); // clears tokens + redirects via window.location
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
