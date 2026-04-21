import { FC } from "react";
import { SidebarSectionProps } from "./types.js";

export const SidebarSection: FC<SidebarSectionProps> = ({
  title,
  children,
  isCollapsed,
}) => {
  return (
    <div className="relative">
      {!isCollapsed && (
        <div className="flex items-center gap-2 mt-4 mb-2 px-3 relative">
          <h3 className="relative text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 z-10">
            {title}
          </h3>
        </div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
};
