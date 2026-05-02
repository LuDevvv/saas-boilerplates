import React from "react";
import { cn } from "../../utils.js";

export interface UsageBarProps {
  current: number;
  limit: number;
  className?: string;
}

/**
 * Premium progress bar that changes color based on percentage
 * Cyan < 70%, Orange < 90%, Red >= 90%
 */
export const UsageBar: React.FC<UsageBarProps> = ({ current, limit, className }) => {
  const percentage = Math.min(Math.round((current / limit) * 100), 100);
  
  const getBarColor = (pct: number) => {
    if (pct >= 90) return "bg-[#EF4F5F] shadow-[0_0_15px_rgba(239,79,95,0.4)]";
    if (pct >= 70) return "bg-[#F4A524] shadow-[0_0_15px_rgba(244,165,36,0.4)]";
    return "bg-[#00E6E6] shadow-[0_0_15px_rgba(0,230,230,0.4)]";
  };

  return (
    <div className={cn("w-full h-2 rounded-full overflow-hidden relative bg-[#F1F5F9] dark:bg-[#FFFFFF]/5 border border-[#E2E8F0] dark:border-[#FFFFFF]/5", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-1000 ease-out",
          getBarColor(percentage)
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
