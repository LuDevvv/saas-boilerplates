import { LucideIcon } from "lucide-react";
import React, { FC, ReactNode } from "react";

import { cn } from "../../utils.js";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  iconClassName?: string;
  compact?: boolean;
  variant?: "default" | "minimal";
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  iconClassName,
  compact = false,
  variant = "default"
}) => {
  const isMinimal = variant === "minimal";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center w-full transition-all",
        !isMinimal && (compact 
          ? "py-8 px-6 rounded-2xl border border-border-subtle bg-gray-50/30 dark:bg-transparent" 
          : "py-16 px-8 rounded-[32px] border-2 border-dashed border-border-subtle bg-gray-50/30 dark:bg-transparent"),
        className
      )}
    >
      <div className={cn(
        "flex items-center justify-center transition-all",
        !isMinimal && "bg-white dark:bg-white/5 border border-border shadow-sm",
        compact 
          ? "w-12 h-12 rounded-xl mb-4" 
          : "w-20 h-20 rounded-3xl mb-6",
        iconClassName
      )}>
        <Icon
          size={compact ? 24 : 40}
          strokeWidth={compact ? 2 : 1.5}
          className="text-fg-muted"
        />
      </div>
      <h2 className={cn(
        "font-heading text-fg leading-tight",
        compact ? "text-[14px] font-bold mb-1" : "text-xl mb-2"
      )}>
        {title}
      </h2>
      <p className={cn(
        "font-label text-fg-secondary max-w-sm leading-relaxed mb-6",
        compact ? "text-[11px]" : "text-sm"
      )}>
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};
