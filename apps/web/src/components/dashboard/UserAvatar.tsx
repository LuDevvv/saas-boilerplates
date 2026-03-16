import { cn } from "../../utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui";
import { LogOut, Shield, ChevronRight } from "lucide-react";

import { useUser } from "../../hooks/useUser";
import { useUI } from "../../hooks/useUI";
import { useAuth } from "../../hooks/useAuth";

/**
 * UserAvatar Component.
 * Pure UI component for user identity management.
 * Interfaces with the new modular store architecture.
 */
export function UserAvatar() {
  const { user } = useUser();
  const { isSidebarCollapsed, isLoading } = useUI();
  const { logout } = useAuth();

  if (isLoading) {
    return (
      <div className="w-9 h-9 rounded-lg bg-secondary border border-border animate-pulse shadow-sm mx-auto" />
    );
  }

  return (
    <DropdownMenu>
      <div className="relative group/user-nav">
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-3 px-2 h-11 transition-all duration-300 w-full rounded-xl hover:bg-secondary/15 relative group/user-profile cursor-pointer outline-none mb-1",
              isSidebarCollapsed && "justify-center",
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center font-black text-[11px] transition-all duration-500 shadow-sm border border-border/10 shrink-0",
                "bg-foreground text-background group-hover/user-profile:scale-105",
              )}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            {!isSidebarCollapsed && (
              <div className="flex flex-col items-start min-w-0 flex-1 transition-all duration-500 overflow-hidden">
                <span className="text-[11px] font-black uppercase tracking-tight text-foreground truncate w-full">
                  Identity Core
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Shield className="w-2.5 h-2.5 text-primary" />
                  <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none">
                    Verified Auth
                  </span>
                </div>
              </div>
            )}

            {!isSidebarCollapsed && (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover/user-profile:text-foreground/40 transition-all duration-500 shrink-0" />
            )}
          </div>
        </DropdownMenuTrigger>

        {/* Collapsed Mode Tooltip fallback */}
        {isSidebarCollapsed && (
          <div className="fixed left-[76px] px-2.5 py-1.5 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover/user-nav:opacity-100 transition-all duration-300 z-[100] whitespace-nowrap shadow-xl border border-border/10 translate-x-3 group-hover/user-nav:translate-x-4">
            User Profile
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-foreground rotate-45 rounded-sm -z-10" />
          </div>
        )}
      </div>

      <DropdownMenuContent
        align="center"
        side="right"
        sideOffset={12}
        className="w-52 p-1 rounded-2xl border-border/10 shadow-2xl backdrop-blur-xl bg-background/95"
      >
        <DropdownMenuLabel className="px-3 py-2 flex flex-col gap-0.5">
          <span className="text-[11px] font-black uppercase tracking-tight text-foreground leading-tight">
            {user?.name}
          </span>
          <span className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-tighter truncate">
            {user?.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-border/40" />
        <MenuItem
          href="/profile"
          icon={<Shield className="w-3.5 h-3.5" />}
          label="Security"
        />
        <DropdownMenuSeparator className="my-1 bg-border/5" />
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-destructive/10 text-destructive/50 hover:text-destructive transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-tight">
            Logout System
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <DropdownMenuItem
      onClick={() => (window.location.href = href)}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-secondary/50 transition-all group"
    >
      <div className="text-muted-foreground/30 group-hover:text-foreground">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-tight text-foreground/80">
        {label}
      </span>
    </DropdownMenuItem>
  );
}
