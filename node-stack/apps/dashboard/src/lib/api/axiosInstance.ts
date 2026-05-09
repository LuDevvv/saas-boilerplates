import { createClient } from "@node-stack/api-client";
import axios from "axios";

import { cookieTokenStorage } from "../cookie-storage";

import { useAuthStore } from "@/stores/authStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";

const getActiveWorkspaceId = (): string | null => {
  return useWorkspaceStore.getState().activeWorkspaceId;
};

if (!import.meta.env.VITE_API_URL) {
  console.warn("[api] VITE_API_URL is not set — requests will fail in production.");
}

export const axiosInstance = createClient({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  getToken: () => cookieTokenStorage.getToken(),
  getWorkspaceId: getActiveWorkspaceId,
});

// Response interceptor is now handled by @node-stack/api-client's createClient
// but we keep the error handling (retry/refresh) here
axiosInstance.interceptors.response.use(
  (response) => response,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (error: any) => {
    // Determine if this is a 401 error, handling both AxiosError and AppError
    const status = error.statusCode || error.response?.status || error.originalError?.response?.status;
    const originalRequest = error.config || error.originalError?.config;

    // Auth and core check routes don't retry refresh to avoid loops
    const isAuthRoute = 
      originalRequest?.url?.includes("/auth/login") || 
      originalRequest?.url?.includes("/auth/register") || 
      originalRequest?.url?.includes("/auth/refresh");

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      const refreshToken = cookieTokenStorage.getRefreshToken();

      if (refreshToken) {
        try {
          // Use direct axios to avoid interceptor loop
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL ?? ""}/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;

          cookieTokenStorage.setToken(accessToken);
          if (newRefreshToken) {
            cookieTokenStorage.setRefreshToken(newRefreshToken);
          }

          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (refreshError: any) {
          const rStatus = refreshError?.response?.status || refreshError?.statusCode;
          if (rStatus === 401 || rStatus === 403) {
            cookieTokenStorage.clear();
            try {
              const authStore = useAuthStore.getState();
              authStore.logout();
              if (!window.location.pathname.startsWith("/auth")) {
                window.location.href = "/auth/sign-in";
              }
            } catch {}
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, just logout
        cookieTokenStorage.clear();
        try {
          const authStore = useAuthStore.getState();
          if (authStore.isAuthenticated) {
            authStore.logout();
            if (!window.location.pathname.startsWith("/auth")) {
              window.location.href = "/auth/sign-in";
            }
          }
        } catch {}
      }
    }

    return Promise.reject(error);
  }
);