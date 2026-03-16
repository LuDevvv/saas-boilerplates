import { useEffect, useCallback } from "react";
import { useUserStore } from "../stores/useUserStore";
import { useWorkspaceStore } from "../stores/useWorkspaceStore";
import { useUIStore } from "../stores/useUIStore";
import { authService } from "../services/auth.service";
import Cookies from "js-cookie";

/**
 * useAuth Hook.
 * Handles the hydration of application state and authentication flow.
 * Orchestrates the initial data fetching and synchronizes stores.
 */
export function useAuth() {
  const { user, setUser, clearUser, updateUser } = useUserStore();
  const { setWorkspaces, setActiveWorkspaceId } = useWorkspaceStore();
  const { setLoading, initialize: initializeUI } = useUIStore();

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const data = await authService.getProfile();

      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl,
        twoFactorEnabled: data.twoFactorEnabled || false,
        accounts: data.accounts || [],
      });

      const fetchedWorkspaces = data.workspaces || [];
      setWorkspaces(fetchedWorkspaces);

      if (fetchedWorkspaces.length > 0) {
        const storedId = Cookies.get("activeWorkspaceId");
        const isValidStored = fetchedWorkspaces.find(
          (w: any) => w.id === storedId,
        );

        if (isValidStored && storedId) {
          setActiveWorkspaceId(storedId);
        } else {
          const personal = fetchedWorkspaces.find(
            (w: any) =>
              w.name.toLowerCase().includes("personal") ||
              w.slug.includes("personal"),
          );
          const defaultId = personal ? personal.id : fetchedWorkspaces[0].id;
          setActiveWorkspaceId(defaultId);
        }
      } else {
        setActiveWorkspaceId(null);
      }
    } catch (error) {
      console.error("[useAuth] Failed to load data:", error);
      clearUser();
    } finally {
      setLoading(false);
    }
  }, [setUser, setWorkspaces, setActiveWorkspaceId, setLoading, clearUser]);

  useEffect(() => {
    initializeUI();
    fetchProfile();
  }, [initializeUI, fetchProfile]);

  return {
    user,
    updateUser,
    isAuthenticated: !!user,
    logout: () => {
      clearUser();
      localStorage.removeItem("token");
      Cookies.remove("token");
      window.location.href = "/login";
    },
  };
}
