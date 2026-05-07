import { FC, ReactNode } from "react";
import { cn } from "../../utils.js";

interface HeroHeaderProps {
  title: string;
  subtitle: ReactNode;
  avatar: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
  bannerClassName?: string;
  actionsOutside?: boolean;
}

export const HeroHeader: FC<HeroHeaderProps> = ({
  title,
  subtitle,
  avatar,
  badge,
  actions,
  className,
  bannerClassName,
  actionsOutside = false
}) => {
  return (
    <div className={cn("mb-6 flex flex-col gap-5 sm:gap-6", className)}>
      <div className={cn(
        "min-h-[220px] sm:min-h-[200px] md:h-64 w-full rounded-[32px] overflow-hidden relative px-6 py-8 sm:p-0 transition-all duration-300",
        // Light mode: full brand gradient. Dark mode: muted, low-saturation tint over surface.
        "bg-gradient-to-br from-[rgb(var(--primary-rgb))] to-[var(--primary-600)]",
        "dark:from-[rgb(var(--primary-rgb)/0.18)] dark:via-[rgb(var(--primary-rgb)/0.08)] dark:to-[var(--surface-elevated)]",
        "dark:bg-[var(--surface-elevated)]",
        "border border-white/5 dark:border-[var(--border)]",
        "shadow-sm dark:shadow-none",
        bannerClassName
      )}>
        {/* Subtle decorative gradient overlay — softer in dark mode */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/5 via-transparent to-transparent opacity-20 dark:opacity-10" />

        {/* Action buttons area — Absolute position without affecting text flow */}
        {actions && (
          <div className={cn(
            "absolute top-5 right-5 sm:top-8 sm:right-10 z-20",
            actionsOutside && "hidden sm:block"
          )}>
            {actions}
          </div>
        )}

        {/* Branding & Info Container */}
        <div className={cn(
          "h-full flex flex-col sm:flex-row items-center sm:justify-start gap-5 sm:gap-8 relative z-10",
          "text-white/90 dark:text-[color:var(--text-primary)]",
          "sm:absolute sm:bottom-0 sm:inset-x-0 sm:px-10 md:px-14"
        )}>
          {/* Avatar Section */}
          <div className="shrink-0 flex justify-center w-full sm:w-auto">
            {avatar}
          </div>

          {/* Text Info Section */}
          <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start gap-2.5 sm:gap-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2.5 sm:gap-4 w-full">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase leading-tight truncate max-w-[280px] sm:max-w-full">
                {title}
              </h1>
              <div className="sm:inline-flex items-center">
                {badge}
              </div>
            </div>

            {/* Subtitle area */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-[12px] sm:text-[13px] font-medium uppercase min-w-0 text-white/60 dark:text-[color:var(--text-secondary)]">
              {subtitle}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Actions — Clean separation */}
      {actions && actionsOutside && (
        <div className="sm:hidden px-1">
          {actions}
        </div>
      )}
    </div>
  );
};
