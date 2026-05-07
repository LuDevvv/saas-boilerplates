import { useState, useMemo, useEffect } from "react";
import { ChevronsUpDown, Check, Plus } from "lucide-react";
import { cn } from "@/utils/classNames";
import { useWorkspaces } from "@/features/workspaces/hooks/useWorkspaces";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useShallow } from "zustand/react/shallow";
import { Logo } from "@/assets/logo/logo";
import { CreateWorkspaceModal } from "@/features/workspaces/components/CreateWorkspaceModal";

interface WorkspaceSwitcherProps {
  isCollapsed: boolean;
}

export const WorkspaceSwitcher = ({ isCollapsed }: WorkspaceSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { data: workspaces = [] } = useWorkspaces();
  const activeWorkspaceId = useWorkspaceStore(useShallow((state) => state.activeWorkspaceId));
  const setActiveWorkspace = useWorkspaceStore(useShallow((state) => state.setActiveWorkspace));

  // Auto-initialize active workspace when data loads.
  // If the stored ID is missing or invalid, fall back to the first workspace.
  useEffect(() => {
    if (workspaces.length === 0) return;
    const isValid = activeWorkspaceId && workspaces.some(w => w.id === activeWorkspaceId);
    if (!isValid) {
      setActiveWorkspace(workspaces[0].id);
    }
  }, [workspaces, activeWorkspaceId, setActiveWorkspace]);

  const selectedWorkspace = useMemo(() =>
    workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0],
    [workspaces, activeWorkspaceId]
  );

  if (!selectedWorkspace) return null;

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center w-full border-b border-sidebar-border bg-transparent h-[68px] transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "px-5"
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 group transition-all duration-300 active:scale-[0.97] border-none ring-transparent",
            isCollapsed ? "w-full justify-center gap-0" : "gap-[10px]"
          )}
        >
          {/* Brand Logo - Using the official Solo variant */}
          <div className="relative h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 transition-transform duration-300 group-hover:scale-105">
            <Logo variant="solo" width={24} height={24} className="dark:brightness-110" />
          </div>

          {/* Workspace Info — only rendered when expanded so flex centering stays clean */}
          {!isCollapsed && (
            <div className="flex flex-col items-start overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-fg whitespace-nowrap">
                  {selectedWorkspace.name}
                </span>
                <ChevronsUpDown className="h-3.5 w-3.5 text-sidebar-text/40 group-hover:text-sidebar-text-active transition-colors shrink-0" />
              </div>
              <span className="text-[10px] font-label text-sidebar-text/50 uppercase whitespace-nowrap">
                {selectedWorkspace.role}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !isCollapsed && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40"
          />
          <div
            className="absolute left-4 right-4 top-[72px] z-50 overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar p-1.5 shadow-premium outline-none focus:outline-none ring-0 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="px-3 py-2 text-[10px] font-label uppercase text-sidebar-text">
              Compañías
            </div>
            <div className="space-y-0.5">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    setActiveWorkspace(workspace.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 active:scale-[0.97]",
                    activeWorkspaceId === workspace.id
                      ? "bg-sidebar-active text-sidebar-text-active font-bold"
                      : "text-sidebar-text hover:bg-sidebar-active/50"
                  )}
                >
                  <div className="flex flex-col items-start">
                    <span>{workspace.name}</span>
                    <span className="text-[10px] font-label text-sidebar-text/70 uppercase">
                      {workspace.role}
                    </span>
                  </div>
                  {activeWorkspaceId === workspace.id && <Check className="h-4 w-4 text-sidebar-text-active" />}
                </button>
              ))}
            </div>
            <div className="mt-1.5 border-t border-sidebar-border pt-1.5">
              <button
                onClick={() => { setIsOpen(false); setIsCreateOpen(true); }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-label text-sidebar-text hover:bg-sidebar-active/50 hover:text-sidebar-text-active outline-none focus:outline-none focus-visible:outline-none focus:ring-0 active:scale-[0.97] transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Crear compañía
              </button>
            </div>
          </div>
        </>
      )}

      <CreateWorkspaceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
