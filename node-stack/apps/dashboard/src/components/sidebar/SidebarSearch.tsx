import { FC } from "react";
import { Search, Command } from "lucide-react";

interface SidebarSearchProps {
  isCollapsed: boolean;
  onTogglePalette: () => void;
}

export const SidebarSearch: FC<SidebarSearchProps> = ({ isCollapsed, onTogglePalette }) => {
  return (
    <div className="flex-none px-4 pt-4">
      <div className="relative group">
          {isCollapsed ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePalette();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-sidebar-text/40 transition-all hover:bg-sidebar-active hover:text-primary outline-none focus:outline-none focus-visible:outline-none focus:ring-0 active:scale-95 border border-sidebar-border"
              title="Buscar (⌘+K)"
            >
              <Search className="h-4 w-4" />
            </button>
          ) : (
            <>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-text/30 transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                placeholder="Buscar..."
                onClick={onTogglePalette}
                readOnly
                className="w-full rounded-lg border border-sidebar-border bg-gray-50 dark:bg-white/5 py-2 pl-[42px] pr-12 text-sm outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 transition-all duration-200 text-sidebar-text/80 cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 active:scale-95"
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 pointer-events-none">
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-sidebar-border bg-sidebar-active shadow-sm">
                  <Command className="h-2.5 w-2.5 text-sidebar-text/30" />
                  <span className="text-[10px] font-label text-sidebar-text/40">K</span>
                </div>
              </div>
            </>
        )}
      </div>
    </div>
  );
};
