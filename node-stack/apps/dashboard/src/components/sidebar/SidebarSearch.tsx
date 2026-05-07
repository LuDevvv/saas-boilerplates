import { FC } from "react";
import { Search, Command } from "lucide-react";
import { cn } from "@/utils/classNames";

interface SidebarSearchProps {
  isCollapsed: boolean;
  onTogglePalette: () => void;
}

export const SidebarSearch: FC<SidebarSearchProps> = ({ isCollapsed, onTogglePalette }) => {
  return (
    <div className={cn("flex-none pt-4 transition-all duration-300", isCollapsed ? "flex justify-center px-0" : "px-4")}>
      <div className={cn("relative group flex items-center gap-0", isCollapsed ? "justify-center" : "")}>
        {/* Collapsed Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePalette();
          }}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar text-sidebar-text/40 transition-all hover:bg-sidebar-active hover:text-sidebar-text-active outline-none focus:outline-none focus-visible:outline-none focus:ring-0 border border-sidebar-border duration-300",
            !isCollapsed && "opacity-0 invisible w-0 p-0 overflow-hidden"
          )}
          title="Buscar (⌘+K)"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Expanded Input - CSS Sync */}
        <div className={cn(
          "relative flex-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden",
          isCollapsed ? "opacity-0 invisible w-0" : "opacity-100 visible w-full"
        )}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-text/50 transition-colors" />
          <input
            type="text"
            placeholder="Buscar..."
            onClick={onTogglePalette}
            readOnly
            className="w-full rounded-lg border border-sidebar-border bg-sidebar py-2 pl-[42px] pr-12 text-sm outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 text-sidebar-text/80 cursor-pointer hover:bg-sidebar-active/50 whitespace-nowrap"
          />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 pointer-events-none">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-surface-hover">
              <Command className="h-2.5 w-2.5 text-sidebar-text/50" />
              <span className="text-[10px] font-label text-sidebar-text/50">K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
