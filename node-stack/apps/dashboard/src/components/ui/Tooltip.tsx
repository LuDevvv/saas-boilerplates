import { FC } from "react";

interface TooltipProps {
  content: string;
  badge?: string;
  position: { top: number; left: number };
}

export const Tooltip: FC<TooltipProps> = ({ content, badge, position }) => (
  <div
    className="pointer-events-none fixed z-[9999] whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-xl dark:bg-gray-700"
    style={{
      top: `${position.top}px`,
      left: `${position.left}px`,
      transform: "translateY(-50%)",
    }}
  >
    {content}
    {badge && (
      <span className="ml-2 rounded-full bg-violet-500 px-2 py-0.5">
        {badge}
      </span>
    )}
    <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900 dark:border-r-gray-700" />
  </div>
);
