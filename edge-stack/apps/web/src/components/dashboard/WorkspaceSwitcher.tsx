import { useI18n } from "../../hooks/useI18n";
import { Briefcase, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "../../utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui";

import { useWorkspace } from "../../hooks/useWorkspace";
import { useUI } from "../../hooks/useUI";

/**
 * WorkspaceSwitcher Component.
 * Pure UI component for switching between infrastructure nodes.
 * Interfaces with the new modular store architecture.
 */
export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();
  const { isLoading, isSidebarCollapsed } = useUI();
  const t = useI18n();

  if (isLoading) {
    return (
      <div className="flex items-center justify-between w-full h-11 px-3 border border-border/40 rounded-xl bg-secondary/30 animate-pulse">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-muted/60" />
          <div className="w-16 h-2.5 bg-muted/60 rounded-full" />
        </div>
        {!isSidebarCollapsed && (
          <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground/30" />
        )}
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-secondary/50 text-muted-foreground/60 rounded-xl border border-border/50 text-[11px] font-bold">
        <Briefcase className="w-3.5 h-3.5" />
        {!isSidebarCollapsed && <span>No Workspace</span>}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center w-full h-11 transition-all duration-300",
            "hover:bg-secondary/15 group/switcher outline-none border border-transparent rounded-xl px-2",
            isSidebarCollapsed && "justify-center",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 min-w-0 flex-1",
              isSidebarCollapsed && "justify-center",
            )}
          >
            {/* Technical Brand Container */}
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center font-black text-[11px] transition-all duration-500 shadow-sm border border-border/10 shrink-0",
                "bg-foreground text-background group-hover/switcher:scale-105",
              )}
            >
              {activeWorkspace?.name
                ? activeWorkspace.name.charAt(0).toUpperCase()
                : "A"}
            </div>

            {!isSidebarCollapsed && (
              <div className="flex flex-col items-start min-w-0 overflow-hidden transition-all duration-500 origin-left">
                <span className="text-[11px] font-black leading-none truncate text-foreground tracking-tight uppercase">
                  {activeWorkspace?.name || "Workspace"}
                </span>
                <div className="flex items-center gap-1.5 mt-1 opacity-40">
                  <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.1em]">
                    {activeWorkspace?.memberCount || 1} Nodes Active
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* Indicator */}
          {!isSidebarCollapsed && (
            <ChevronsUpDown className="w-3 h-3 text-muted-foreground/30 group-hover/switcher:text-foreground/60 transition-all duration-500 shrink-0" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="right"
        sideOffset={12}
        className="w-64 p-1.5 shadow-2xl rounded-2xl border-border/10 backdrop-blur-xl bg-background/95 z-[100]"
      >
        <DropdownMenuLabel className="px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          Switch Infrastructure
        </DropdownMenuLabel>
        <div className="space-y-0.5 mt-1">
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => switchWorkspace(workspace.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
                activeWorkspace.id === workspace.id
                  ? "bg-secondary/80 text-foreground"
                  : "hover:bg-secondary/40 text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center shadow-sm font-bold text-[10px]",
                  activeWorkspace.id === workspace.id
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold tracking-tight">
                  {workspace.name}
                </span>
                <span className="text-[9px] opacity-40 uppercase font-black tracking-widest leading-none">
                  {workspace.slug}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="my-1.5 bg-border/50" />
        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary hover:bg-primary/5 cursor-pointer font-bold text-[11px] uppercase tracking-tight transition-colors">
          <Plus className="w-4 h-4" />
          Provision New Node
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
