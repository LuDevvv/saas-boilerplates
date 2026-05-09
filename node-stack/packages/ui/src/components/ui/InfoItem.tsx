import { type LucideIcon, CheckCircle2 } from "lucide-react";
import { FC } from "react";

import { cn } from "../../utils.js";

export interface InfoItemProps {
  /** Lucide icon rendered inside the leading tile. */
  icon: LucideIcon;
  /** Small uppercase label (e.g. "CORREO ELECTRÓNICO"). */
  label: string;
  /** Main value displayed under the label. */
  value: string;
  /** Optional verified indicator — renders a small emerald check when set. */
  badge?: string;
  className?: string;
}

/**
 * Compact label / value pair used in profile and detail screens.
 *
 * Renders an icon tile + label (uppercase) + value, with an optional emerald
 * verification check when `badge` is provided (the badge string is exposed as
 * the `title` attribute for accessibility).
 *
 * @example
 * <InfoItem icon={Mail} label="Correo electrónico" value="user@example.com" badge="Verificado" />
 */
export const InfoItem: FC<InfoItemProps> = ({ icon: Icon, label, value, badge, className }) => (
  <div className={cn("flex items-center gap-3 py-1 group select-none", className)}>
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary border border-primary/15">
      <Icon className="h-4 w-4" />
    </div>

    <div className="min-w-0 flex-1 flex flex-col gap-0.5">
      <p className="text-[11px] font-medium text-fg-muted uppercase ml-0.5">
        {label}
      </p>
      <div className="flex items-center gap-2 flex-wrap px-0.5">
        <p className="text-[14px] font-medium text-fg truncate leading-tight">
          {value}
        </p>
        {badge && (
          <div className="text-emerald-500 dark:text-emerald-400 flex items-center justify-center" title={badge}>
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
    </div>
  </div>
);
