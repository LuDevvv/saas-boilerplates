import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@node-stack/ui";
import { LogOut, Settings } from "lucide-react";
import { FC, useState } from "react";

import { SettingsModal } from "@/features/settings/components/SettingsModal.js";
import { useAuth } from "@/hooks/stores/useAuth";
import { cn } from "@/utils/classNames";


interface UserIdentityProps {
  isCollapsed: boolean;
  currentPage: string;
}

export const UserIdentity: FC<UserIdentityProps> = ({ isCollapsed }) => {
  const { logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="space-y-1">
        {/* Settings button */}
        <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setSettingsOpen(true)}
                className={cn(
                  "group relative flex items-center transition-all duration-200 cursor-pointer outline-none focus:outline-none focus-visible:outline-none active:scale-[0.97]",
                  "text-sidebar-text/50 hover:bg-sidebar-active/50 hover:text-sidebar-text-active transition-colors border border-transparent",
                  isCollapsed
                    ? "w-10 h-10 justify-center rounded-full"
                    : "w-full pl-[10px] pr-4 py-2.5 rounded-xl gap-3"
                )}
              >
                <Settings className="h-5 w-5 flex-shrink-0 text-sidebar-text/50 group-hover:text-sidebar-text-active transition-colors duration-200" />
                {!isCollapsed && (
                  <span className="flex-1 truncate text-sm font-label text-left">Ajustes</span>
                )}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Ajustes</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Logout button */}
        <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => logout()}
                className={cn(
                  "group relative flex items-center transition-all duration-200 cursor-pointer outline-none focus:outline-none focus-visible:outline-none active:scale-[0.97]",
                  "text-sidebar-text/50 hover:bg-red-500/10 hover:text-red-500 transition-colors border border-transparent",
                  isCollapsed
                    ? "w-10 h-10 justify-center rounded-full"
                    : "w-full pl-[10px] pr-4 py-2.5 rounded-xl gap-3"
                )}
              >
                <LogOut className="h-5 w-5 flex-shrink-0 text-sidebar-text/50 group-hover:text-red-500 transition-colors duration-200" />
                {!isCollapsed && (
                  <span className="flex-1 truncate text-sm font-label text-left">Cerrar Sesión</span>
                )}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Cerrar Sesión</TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};
