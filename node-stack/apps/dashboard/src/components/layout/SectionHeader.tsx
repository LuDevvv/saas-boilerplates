import { FC, ReactNode } from "react";
import { cn } from "@/utils/classNames";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  tag?: string;
  action?: ReactNode;
  className?: string;
}

export const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  tag,
  action,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-end justify-between gap-6",
      className
    )}>
      <div className="flex flex-col gap-1">
        {(badge || tag) && (
          <div className="flex items-center gap-2 mb-1">
            {badge && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-label uppercase tracking-wider">
                {badge}
              </span>
            )}
            {tag && (
              <span className="text-[10px] font-label text-gray-400 uppercase tracking-widest">
                {tag}
              </span>
            )}
          </div>
        )}
        <h1 className="text-xl sm:text-2xl font-heading text-gray-950 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm font-label text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex items-center gap-3 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};
