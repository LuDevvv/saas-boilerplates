import { create } from "zustand";
import Cookies from "js-cookie";
import type { IWorkspace } from "../types";

interface WorkspaceStore {
  workspaces: IWorkspace[];
  activeWorkspaceId: string | null;
  activeWorkspace: IWorkspace | null;
  isOrg: boolean;
  setWorkspaces: (workspaces: IWorkspace[]) => void;
  setActiveWorkspaceId: (id: string | null) => void;
  switchWorkspace: (id: string) => void;
}

/**
 * Workspace Store.
 * Orchestrates workspace switching and derived states like 'isOrg'.
 */
export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: Cookies.get("activeWorkspaceId") || null,
  activeWorkspace: null,
  isOrg: false,

  setWorkspaces: (workspaces) => {
    const { activeWorkspaceId } = get();
    const active = workspaces.find((w) => w.id === activeWorkspaceId) || null;
    const isOrg = active
      ? !active.name.toLowerCase().includes("personal") &&
        !active.slug.includes("personal")
      : false;

    set({ workspaces, activeWorkspace: active, isOrg });
  },

  setActiveWorkspaceId: (id) => {
    const { workspaces } = get();
    const active = workspaces.find((w) => w.id === id) || null;
    const isOrg = active
      ? !active.name.toLowerCase().includes("personal") &&
        !active.slug.includes("personal")
      : false;

    if (id) {
      Cookies.set("activeWorkspaceId", id, { expires: 7, sameSite: "strict" });
    } else {
      Cookies.remove("activeWorkspaceId");
    }

    set({ activeWorkspaceId: id, activeWorkspace: active, isOrg });
  },

  switchWorkspace: (id) => {
    const { workspaces } = get();
    const target = workspaces.find((w) => w.id === id);
    if (target) {
      get().setActiveWorkspaceId(id);
      window.location.reload();
    }
  },
}));
