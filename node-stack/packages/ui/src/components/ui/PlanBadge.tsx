import React, { FC } from "react";
import { cn } from "../../utils.js";
import { Crown, Sparkles } from "lucide-react";

export interface PlanBadgeProps {
  planName?: string;
  isPremium?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export const PlanBadge: FC<PlanBadgeProps> = ({
  planName,
  isPremium,
  size = "md",
  className,
}) => {
  const sizeClasses = {
    xs: "text-[9px] px-1.5 py-0.5 gap-0.5",
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1 gap-2",
  };

  const iconSizes = {
    xs: "w-2.5 h-2.5",
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  const isPro = planName === "Pro" || planName === "Business" || planName === "Premium" || isPremium;
  const displayLabel = (planName || (isPremium ? "Pro" : "Gratis")).replace(/Premium/g, "Pro");

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
        "inline-flex items-center rounded-full font-label uppercase  transition-all duration-300",
        "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400 border border-gray-200 dark:border-white/10",
        sizeClasses[size],
        className
      )}
    >
      <Sparkles className={cn(iconSizes[size], "flex-shrink-0")} />
      <span>{displayLabel}</span>
    </div>
  );
};
