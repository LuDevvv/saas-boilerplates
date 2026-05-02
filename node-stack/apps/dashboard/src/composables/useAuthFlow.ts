import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/stores/authStore";
import { useShallow } from "zustand/react/shallow";
import { cookieTokenStorage } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { appToast } from "@/components/alerts/Toasts";
import type { LoginDto, RegisterDto } from "@node-stack/types";
import type { AuthResponse } from "@/features/auth/api/types";

export const useLoginFlow = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore(useShallow((state) => state.setAuth));
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginDto>({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: ({ token, user }) => {
      setAuth(token);
      cookieTokenStorage.setToken(token);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });

      appToast.success({
        title: "¡Bienvenido de nuevo!",
        description: `Hola ${user.firstName || user.email}`,
      });
      navigate("/");
    },
    onError: (error: Error) => {
      appToast.error({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales inválidas",
      });
    },
  });
};

export const useRegisterFlow = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore(useShallow((state) => state.setAuth));
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, RegisterDto>({
    mutationFn: (userData) => authApi.register(userData),
    onSuccess: ({ token, user }) => {
      setAuth(token);
      cookieTokenStorage.setToken(token);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });

      appToast.success({
        title: "¡Cuenta creada!",
        description: `Bienvenido ${user.firstName || user.email}`,
      });
      navigate("/");
    },
    onError: (error: Error) => {
      appToast.error({
        title: "Error al registrarse",
        description: error.message || "El correo ya está en uso",
      });
    },
  });
};

export const useLogoutFlow = () => {
  const clearStore = useAuthStore(useShallow((state) => state.logout));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearStore();
      cookieTokenStorage.removeToken();
      queryClient.clear();
      navigate("/auth/sign-in");
    },
  });
};