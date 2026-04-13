import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import { CookieTokenStorage } from "./cookie-storage";
import { appToast } from "@/components/alerts/Toasts";

const cookieStorage = new CookieTokenStorage("token", {
  secure: window.location.protocol === "https:",
  sameSite: "lax",
  expires: 7,
  path: "/",
});

export const cookieTokenStorage = cookieStorage;

/**
 * Standard Axios instance for the Dashboard Boilerplate.
 * Decoupled from proprietary SDKs.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:3000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Token & Workspace ID
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = cookieStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500;
    const isUnauthorized = error.response && error.response.status === 401;

    if (isNetworkError) {
      appToast.error(
        {
          title: "Connection Error",
          description: "Please check your internet connection and try again.",
        },
        { id: "network-error" }
      );
    } else if (isServerError) {
      appToast.error(
        {
          title: "Server Error",
          description: "Our engineers are notified. Please try again later.",
        },
        { id: "server-error" }
      );
    } else if (isUnauthorized) {
      // Local logout logic can be triggered here
    }

    return Promise.reject(error);
  }
);
