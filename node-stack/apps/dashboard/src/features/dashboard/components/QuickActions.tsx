import { FC } from "react";
import { LucideIcon, ArrowUpRight } from "lucide-react";
import { LinkTransition } from "@/components/utils/LinkTransition";
import { cn } from "@/utils/classNames";

export interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  route: string;
  iconColor?: string;
  iconBg?: string;
  headerBg?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export const QuickActions: FC<QuickActionsProps> = ({ actions, className }) => {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4", className)}>
      {actions.map((action, i) => (
        <LinkTransition
          key={i}
          href={action.route}
          className={cn(
            "group flex flex-col overflow-hidden rounded-[20px] text-left",
            "border border-border bg-surface",
            "hover:shadow-[var(--shadow-card)] hover:border-border-strong",
            "hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
          )}
        >
          {/* Visual header — fluid height via padding, decorative icon bottom-right */}
          <div
            className={cn(
              "relative overflow-hidden px-4 pt-4 pb-6",
              action.headerBg ?? "bg-surface-muted"
            )}
          >
            {/* Large decorative icon — bottom-right watermark */}
            <action.icon
              className={cn(
                "absolute -bottom-3 -right-2 h-[72px] w-[72px] rotate-[14deg]",
                "opacity-[0.10] transition-all duration-500",
                "group-hover:opacity-[0.17] group-hover:scale-110 group-hover:rotate-[18deg]",
                action.iconColor ?? "text-fg-muted"
              )}
            />

            {/* Small focused icon card */}
            <div
              className={cn(
                "relative h-9 w-9 rounded-[12px] flex items-center justify-center",
                "bg-surface-elevated border border-border",
                "shadow-[var(--shadow-sm)]",
                "transition-transform duration-300 group-hover:scale-105"
              )}
            >
              <action.icon
                className={cn("h-[18px] w-[18px]", action.iconColor ?? "text-fg-secondary")}
              />
            </div>
          </div>

          {/* Content — explicitly left-aligned */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 sm:py-3.5 text-left">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] sm:text-[14px] font-semibold text-fg leading-snug text-left">
                {action.label}
              </p>
              <p className="text-[11px] text-fg-muted mt-0.5 truncate text-left">
                {action.description}
              </p>
            </div>
            <ArrowUpRight
              className={cn(
                "h-4 w-4 shrink-0 transition-all duration-200",
                "text-fg-disabled",
                "group-hover:text-fg-secondary",
                "group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              )}
            />
          </div>
        </LinkTransition>
      ))}
    </div>
  );
};
