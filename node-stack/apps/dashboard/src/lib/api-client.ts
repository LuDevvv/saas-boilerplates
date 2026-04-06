import { 
  createClient, 
  AppError, 
  auth, 
  workspace, 
} from "@node-stack/api-client";
import { siteConfig } from "@/config/site-config";
import Cookies from "js-cookie";

const getToken = (): string | null => {
  if (siteConfig.auth.storage === "cookie") {
    return Cookies.get(siteConfig.auth.tokenKey) || null;
  }
  return localStorage.getItem(siteConfig.auth.tokenKey);
};

const getWorkspaceId = (): string | null => {
  return localStorage.getItem("active_workspace_id");
};

const handleUnauthorized = () => {
  removeToken();
  if (window.location.pathname !== "/auth/sign-in") {
    window.location.href = "/auth/sign-in";
  }
};

export const createApiClient = () => {
  const baseURL = import.meta.env["VITE_API_URL"] || "http://localhost:3000/api";
  
  const axiosClient = createClient({
    baseURL,
    timeout: 10000,
    getToken,
    getWorkspaceId,
    onUnauthorized: handleUnauthorized,
  });

  return {
    axios: axiosClient,
    auth: auth(axiosClient),
    workspace: workspace(axiosClient),
    setToken,
    removeToken,
    getToken,
  };
};

export const apiClient = createApiClient();

export const setToken = (token: string) => {
  if (siteConfig.auth.storage === "cookie") {
    Cookies.set(siteConfig.auth.tokenKey, token, { expires: 7, secure: true, sameSite: "lax" });
  } else {
    localStorage.setItem(siteConfig.auth.tokenKey, token);
  }
};

export const removeToken = () => {
  if (siteConfig.auth.storage === "cookie") {
    Cookies.remove(siteConfig.auth.tokenKey);
  } else {
    localStorage.removeItem(siteConfig.auth.tokenKey);
  }
};

export { AppError };
export { createClient } from "@node-stack/api-client";

export default apiClient.axios;