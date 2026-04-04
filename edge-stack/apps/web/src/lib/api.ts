import { hc } from "hono/client";
import type { AppType } from "../../../api/src/index";
import Cookies from "js-cookie";

/**
 * End-to-end typed Hono RPC Client.
 * Note: If TypeScript reports 'unknown', ensure @workspace/api is properly resolved.
 */
const baseUrl = import.meta.env.PUBLIC_API_URL || "http://localhost:8787";

export const client = hc<AppType>(baseUrl, {
  headers: (): Record<string, string> => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token") || Cookies.get("token");
      const workspaceId = Cookies.get("activeWorkspaceId");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      if (workspaceId) {
        headers["x-workspace-id"] = workspaceId;
      }
      return headers;
    }
    return {};
  },
});

/**
 * Persist the auth token to local storage and cookies for fallback/SSR access.
 */
export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    Cookies.set("token", token, {
      expires: 7,
      secure: true,
      sameSite: "strict",
    });
  }
};

/**
 * Clear the persistent auth state.
 */
export const clearAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    Cookies.remove("token");
    Cookies.remove("activeWorkspaceId");
  }
};
