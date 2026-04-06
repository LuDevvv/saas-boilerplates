import { FC, ReactNode } from "react";

interface SidebarTooltipProps {
  content: string;
  children: ReactNode;
  show: boolean;
}

export const SidebarTooltip: FC<SidebarTooltipProps> = ({
  content,
  children,
  show,
}) => {
  if (!show) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {children}
      <div className="tooltip pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="relative whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-lg dark:bg-gray-700">
          {content}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
        </div>
      </div>
    </div>
  );
};
