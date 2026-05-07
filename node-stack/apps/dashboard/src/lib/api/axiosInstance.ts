import axios from "axios";
import { createClient } from "@node-stack/api-client";
import { cookieTokenStorage } from "../cookie-storage";

const getActiveWorkspaceId = (): string | null => {
  try {
    const { useWorkspaceStore } = require("@/stores/workspaceStore");
    return useWorkspaceStore.getState().activeWorkspaceId;
  } catch {
    return null;
  }
};

export const axiosInstance = createClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1",
  getToken: () => cookieTokenStorage.getToken(),
  getWorkspaceId: getActiveWorkspaceId,
});

// Response interceptor is now handled by @node-stack/api-client's createClient
// but we keep the error handling (retry/refresh) here
axiosInstance.interceptors.response.use(
  (response) => response,
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
            `${import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1"}/auth/refresh`,
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
        } catch (refreshError: any) {
          const rStatus = refreshError?.response?.status || refreshError?.statusCode;
          if (rStatus === 401 || rStatus === 403) {
            cookieTokenStorage.clear();
            try {
              const { useAuthStore } = require("@/stores/authStore");
              const authStore = useAuthStore.getState();
              authStore.logout();
              if (!window.location.pathname.startsWith("/auth")) {
                window.location.href = "/auth/sign-in";
              }
            } catch (e) {}
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, just logout
        cookieTokenStorage.clear();
        try {
          const { useAuthStore } = require("@/stores/authStore");
          const authStore = useAuthStore.getState();
          if (authStore.isAuthenticated) {
            authStore.logout();
            if (!window.location.pathname.startsWith("/auth")) {
              window.location.href = "/auth/sign-in";
            }
          }
        } catch (e) {}
      }
    }

    return Promise.reject(error);
  }
);