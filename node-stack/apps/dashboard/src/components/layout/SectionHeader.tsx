import { FC, ReactNode } from "react";

import { cn } from "@/utils/classNames";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  tag?: string;
  action?: ReactNode;
  className?: string;
  showBreadcrumbs?: boolean;
}

export const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  tag,
  action,
  className,
  showBreadcrumbs = true
}) => {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {showBreadcrumbs && (
        <div className="lg:hidden flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase  text-gray-400">
            <span className="opacity-60">Panel</span>
            <span className="opacity-40">/</span>
            {badge && (
              <>
                <span className="text-primary/80">{badge}</span>
                <span className="opacity-40">/</span>
              </>
            )}
            <span className="text-fg">{tag || title}</span>
          </div>
        </div>
      )}

      <div className={cn(
        "flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      )}>
        <div className="flex flex-col gap-1">
          {(badge || tag) && (
            <div className="flex items-center gap-2 mb-1">
              {badge && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-label uppercase ">
                  {badge}
                </span>
              )}
              {tag && (
                <span className="text-[10px] font-label text-gray-400 uppercase ">
                  {tag}
                </span>
              )}
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-heading text-fg">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm font-label text-fg-secondary">
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
    </div>
  );
};
