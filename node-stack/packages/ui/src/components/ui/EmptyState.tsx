import React, { FC, ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "../../utils.js";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  iconClassName?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  iconClassName,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-8 text-center w-full rounded-[32px] border-2 border-dashed border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-transparent",
        className
      )}
    >
      <div className={cn(
        "w-20 h-20 rounded-3xl bg-white dark:bg-white/5 flex items-center justify-center mb-6 border border-gray-100 dark:border-white/10 shadow-sm",
        iconClassName
      )}>
        <Icon
          size={40}
          strokeWidth={1.5}
          className="text-gray-400 dark:text-gray-500"
        />
      </div>
      <h2 className="text-xl font-heading text-gray-950 dark:text-white mb-2 ">
        {title}
      </h2>
      <p className="text-sm font-label text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-8">        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {action}
        {secondaryAction}
      </div>
    </div>
  );
};
