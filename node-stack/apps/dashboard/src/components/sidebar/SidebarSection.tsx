import { FC } from "react";
import { SidebarSectionProps } from "./types";

export const SidebarSection: FC<SidebarSectionProps> = ({
  title,
  children,
  isCollapsed,
}) => {
  return (
    <div className="relative">
      {!isCollapsed && (
        <div className="flex items-center gap-2 mt-4 mb-2 px-3 relative">
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700/50 to-transparent" />
          <h3 className="relative text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900/95 px-2 z-10">
            {title}
          </h3>
        </div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
};
