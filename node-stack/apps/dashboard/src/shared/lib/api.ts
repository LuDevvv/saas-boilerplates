import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from "axios";
import { useWorkspaceStore } from "@/stores/workspaceStore";

const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = cookieTokenStorage.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const workspaceId = getActiveWorkspaceId();
      if (workspaceId && config.headers) {
        config.headers["X-Workspace-ID"] = workspaceId;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          cookieTokenStorage.setToken(data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return instance(originalRequest);
        } catch {
          cookieTokenStorage.removeToken();
          window.location.href = "/auth/sign-in";
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

const getActiveWorkspaceId = (): string | null => {
  try {
    return useWorkspaceStore.getState().activeWorkspaceId;
  } catch {
    return null;
  }
};

export const apiClient = createApiClient();

class CookieTokenStorage {
  private readonly TOKEN_KEY = "auth_token";

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

export const cookieTokenStorage = new CookieTokenStorage();
