import { FC } from "react";
import { cn } from "@/utils/classNames";
import { Crown, Sparkles } from "lucide-react";

interface PlanBadgeProps {
  planName?: string;
  isPremium?: boolean; // Deprecated, but keeping for compatibility if needed
  size?: "xs" | "sm" | "md" | "lg";
}

export const PlanBadge: FC<PlanBadgeProps> = ({
  planName,
  isPremium,
  size = "md",
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
          "inline-flex items-center rounded-full font-semibold uppercase tracking-wider transition-colors",
          "bg-gradient-to-r from-violet-500 to-purple-600 text-white",
          sizeClasses[size]
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
        "inline-flex items-center rounded-full font-medium uppercase tracking-wide transition-colors",
        "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        sizeClasses[size]
      )}
    >
      <Sparkles className={cn(iconSizes[size], "flex-shrink-0")} />
      <span>{displayLabel}</span>
    </div>
  );
};
