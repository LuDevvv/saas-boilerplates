import { FC } from "react";
import { cn } from "@/utils/classNames";
import { LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/stores/useAuth";
import { SidebarItem } from "./SidebarItem.js";

interface UserIdentityProps {
  isCollapsed: boolean;
  currentPage: string;
}

export const UserIdentity: FC<UserIdentityProps> = ({ isCollapsed, currentPage }) => {
  const { logout } = useAuth();

  return (
    <div className="space-y-4">
      {/* Profile Card - Premium Bento version */}
      {/* <div className={cn(
        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
        isCollapsed
          ? "justify-center bg-transparent"
          : "bg-gray-50 dark:bg-white/5 border border-sidebar-border hover:bg-gray-100 dark:hover:bg-white/10"
      )}>
        <div className="relative shrink-0">
          <img
            src={user?.avatar || "https://avatars.githubusercontent.com/u/107328372?v=4"}
            className="h-9 w-9 rounded-lg object-cover border border-sidebar-border shadow-sm transition-transform duration-300"
            alt="Profile"
          />
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 shadow-sm" />
        </div>

        {!isCollapsed && (
          <div className="flex flex-col min-w-0 animate-fade-in-fast">
            <span className="text-sm font-heading text-gray-950 dark:text-white truncate">
              {user?.firstName || "Admin Elora"}
            </span>
            <span className="text-[10px] font-label text-sidebar-text uppercase  truncate opacity-60">
              {user?.role?.replace('_', ' ') || "Empresa"}
            </span>
          </div>
        )}
      </div> */}

      {/* Action Buttons - Minimal versions */}
      <div className="space-y-1">
        <SidebarItem
          icon={Settings}
          label="Ajustes"
          path="/settings"
          isActive={currentPage.startsWith("/settings")}
          isCollapsed={isCollapsed}
        />

        <button
          onClick={() => logout()}
          className={cn(
            "group relative flex items-center transition-all duration-200 cursor-pointer w-full pl-[10px] pr-4 py-2.5 rounded-lg border border-transparent outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50",
            "text-sidebar-text/60 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400",
            "gap-3"
          )}
          title={isCollapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
          {!isCollapsed && (
            <div className="flex-1 truncate text-sm font-label animate-fade-in-fast text-left">
              Cerrar Sesión
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
