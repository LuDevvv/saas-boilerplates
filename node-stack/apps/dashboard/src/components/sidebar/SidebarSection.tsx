import { FC } from "react";
import { SidebarSectionProps } from "./types.js";

export const SidebarSection: FC<SidebarSectionProps> = ({
  title,
  children,
  isCollapsed,
}) => {
  return (
    <div className="relative w-full">
      {!isCollapsed && (
        <div className="flex items-center gap-[6px] mt-6 mb-2 pl-[10px] relative">
          <h3 className="relative text-[10px] font-label uppercase text-sidebar-text/40 z-10">
            {title}
          </h3>
        </div>
      )}
      <div className={isCollapsed ? "flex flex-col items-center w-full space-y-2" : "space-y-1"}>
        {children}
      </div>
    </div>
  );
};
