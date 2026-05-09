import { LucideIcon } from "lucide-react";
import { FC, ReactNode } from "react";

import { cn } from "@/utils/classNames";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const SectionCard: FC<SectionCardProps> = ({
  title, subtitle, icon: Icon, iconColor = "text-primary bg-primary/10",
  action, children, className, noPadding,
}) => (
  <div className={cn("rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]", className)}>
    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border-subtle">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className={cn("h-8 w-8 rounded-[10px] flex items-center justify-center shrink-0", iconColor)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-fg truncate">{title}</p>
          {subtitle && <p className="text-[11px] text-fg-muted">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    <div className={noPadding ? "" : "p-5"}>{children}</div>
  </div>
);
