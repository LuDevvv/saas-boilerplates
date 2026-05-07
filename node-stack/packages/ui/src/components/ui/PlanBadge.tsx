import React, { FC } from "react";
import { cn } from "../../utils.js";
import { Crown, Sparkles } from "lucide-react";

export interface PlanBadgeProps {
  planName?: string;
  isPremium?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "px-1.5 py-0.5 text-[9px] gap-1",
  sm: "px-2 py-1 text-[10px] gap-1",
  md: "px-2.5 py-1.5 text-xs gap-1.5",
  lg: "px-3 py-2 text-sm gap-2",
};

const iconSizes = {
  xs: "h-2.5 w-2.5",
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export const PlanBadge: FC<PlanBadgeProps> = ({
  planName = "Free",
  isPremium = false,
  size = "md",
  className,
}) => {
  const isPro = isPremium || planName.toLowerCase().includes("pro") || planName.toLowerCase().includes("premium");
  const displayLabel = isPro ? planName : "Free";

  if (isPro) {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full font-label uppercase  transition-all duration-300",
          "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm shadow-violet-500/20",
          sizeClasses[size],
          className
        )}
      >
        <Crown className={cn(iconSizes[size], "flex-shrink-0")} />
        <span>{displayLabel}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-label uppercase bg-surface-muted text-gray-400 border border-border",
        sizeClasses[size],
        className
      )}
    >
      <Sparkles className={cn(iconSizes[size], "flex-shrink-0")} />
      <span>{displayLabel}</span>
    </div>
  );
};
