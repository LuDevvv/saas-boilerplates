import type { LoginDto, RegisterDto, AuthResponse } from "@node-stack/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { appToast } from "@/components/alerts/Toasts";
import { api, cookieTokenStorage } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useAuthStore } from "@/stores/authStore";

export const useLoginFlow = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore(useShallow((state) => state.setUser));
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginDto & { rememberMe?: boolean }>({
    mutationFn: (credentials) => api.auth.login(credentials),
    onSuccess: ({ accessToken, refreshToken, user }, variables) => {
      const cookieOptions = variables.rememberMe ? { expires: 90 } : { expires: 30 };

      setUser(user);
      cookieTokenStorage.setToken(accessToken, cookieOptions);
      if (refreshToken) {
        cookieTokenStorage.setRefreshToken(refreshToken, cookieOptions);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });

      appToast.success({
        title: "¡Bienvenido de nuevo!",
        description: `Hola ${user.firstName || user.email}`,
      });
      navigate("/");
    },
    onError: () => {
      // Handled by the component
    },
  });
};

export const useRegisterFlow = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore(useShallow((state) => state.setUser));
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, RegisterDto>({
    mutationFn: (userData) => api.auth.register(userData),
    onSuccess: ({ accessToken, refreshToken, user }) => {
      setUser(user);
      cookieTokenStorage.setToken(accessToken);
      if (refreshToken) {
        cookieTokenStorage.setRefreshToken(refreshToken);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });

      appToast.success({
        title: "¡Cuenta creada!",
        description: `Bienvenido ${user.firstName || user.email}`,
      });
      navigate("/");
    },
    onError: () => {
      // Handled by the component
    },
  });
};

export const useLogoutFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.auth.logout(),
    onMutate: () => {
      // 1. Desconectar la sesión inmediatamente para que ProtectedRoute inicie la redirección al login.
      // NO usamos clearUser() aquí para evitar que "user" sea null mientras el dashboard sigue renderizado
      // (lo que causaba el pantallazo blanco cuando el Header intentaba leer user.firstName).
      useAuthStore.setState({ isAuthenticated: false });
    },
    onSettled: () => {
      // 2. Dar tiempo a que React Router desmonte el Dashboard completamente,
      // y luego limpiar la caché y el objeto del usuario de forma segura.
      setTimeout(() => {
        queryClient.clear();
        useAuthStore.getState().clearUser();
      }, 50);
    },
  });
};


