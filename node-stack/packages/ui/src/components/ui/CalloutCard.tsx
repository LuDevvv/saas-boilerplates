import type { LucideIcon } from "lucide-react";
import { FC, ReactNode } from "react";

import { StatusPill, type StatusPillTone } from "./StatusPill.js";
import { cn } from "../../utils.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CalloutTone = "primary" | "success" | "info" | "warning" | "neutral";
export type CalloutVariant = "card" | "muted" | "promo";
export type CalloutLayout = "vertical" | "horizontal";

interface CalloutStatus {
  label: string;
  tone?: Exclude<StatusPillTone, "danger">;
  /** When true, shows an animated pulse dot before the label. */
  pulse?: boolean;
}

export interface CalloutCardProps {
  /** Lucide icon component for the leading tile. */
  icon: LucideIcon;
  /** Colors the icon tile + accent. Defaults to "primary". */
  iconTone?: CalloutTone;
  /** Surface treatment. `card` = bordered surface; `muted` = inset; `promo` = brand gradient. */
  variant?: CalloutVariant;
  /** `vertical` stacks; `horizontal` aligns icon | text | action in a row. */
  layout?: CalloutLayout;

  /** Small uppercase label above the title (e.g. "Seguridad legal"). */
  eyebrow?: string;
  title: string;
  description?: string;

  /** Optional CTA — rendered at the bottom (vertical) or right (horizontal). */
  action?: ReactNode;
  /** Optional content rendered top-right (custom badge, icon, etc.). */
  trailing?: ReactNode;
  /** Animated status pill (e.g. "Activado y seguro"). */
  status?: CalloutStatus;

  className?: string;
}

// ─── Style maps ──────────────────────────────────────────────────────────────

const ICON_TONE_CLASSES: Record<CalloutTone, { tile: string; text: string }> = {
  primary: { tile: "bg-primary/10", text: "text-primary" },
  success: { tile: "bg-emerald-500/10", text: "text-emerald-500" },
  info: { tile: "bg-blue-500/10", text: "text-blue-500 dark:text-blue-400" },
  warning: { tile: "bg-amber-500/10", text: "text-amber-500 dark:text-amber-400" },
  neutral: { tile: "bg-surface-hover", text: "text-fg-secondary" },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const IconTile: FC<{ icon: LucideIcon; tone: CalloutTone; variant: CalloutVariant }> = ({
  icon: Icon,
  tone,
  variant,
}) => {
  if (variant === "promo") {
    return (
      <div className="h-10 w-10 rounded-[12px] bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-white" />
      </div>
    );
  }
  const { tile, text } = ICON_TONE_CLASSES[tone];
  return (
    <div className={cn("h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0", tile)}>
      <Icon className={cn("h-5 w-5", text)} />
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

export const CalloutCard: FC<CalloutCardProps> = ({
  icon,
  iconTone = "primary",
  variant = "card",
  layout = "vertical",
  eyebrow,
  title,
  description,
  action,
  trailing,
  status,
  className,
}) => {
  const isPromo = variant === "promo";
  const isHorizontal = layout === "horizontal";

  // Surface
  const surfaceClasses = cn(
    "relative rounded-[20px] overflow-hidden transition-all duration-300",
    variant === "card" && "bg-surface border border-border shadow-[var(--shadow-sm)]",
    variant === "muted" && "bg-surface-muted border border-border",
    isPromo && "bg-gradient-to-br from-primary to-primary-600 text-white"
  );

  // Padding scales with layout
  const paddingClasses = isHorizontal ? "p-5 sm:p-6" : "p-5";

  // Layout container — horizontal aligns row, vertical stacks
  const containerClasses = isHorizontal
    ? "flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5"
    : "flex flex-col gap-4";

  // Text colors switch in promo
  const titleColor = isPromo ? "text-white" : "text-fg";
  const descriptionColor = isPromo ? "text-white/70" : "text-fg-secondary";
  const eyebrowColor = isPromo ? "text-white/60" : "text-fg-muted";

  const renderStatus = status && (
    <StatusPill label={status.label} tone={status.tone ?? "neutral"} pulse={status.pulse} />
  );

  return (
    <div className={cn(surfaceClasses, paddingClasses, className)}>
      {/* Promo decoration — only on promo variant */}
      {isPromo && (
        <>
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/[0.05] pointer-events-none" />
          <div className="absolute -bottom-8 -left-6 h-28 w-28 rounded-full bg-white/[0.04] pointer-events-none" />
        </>
      )}

      <div className={cn("relative z-10", containerClasses)}>
        {/* Top row: icon + (status / trailing) — always at the top in vertical, on the left in horizontal */}
        <div className={cn(
          "flex items-start justify-between gap-3",
          isHorizontal && "sm:contents"  // horizontal flattens the row to siblings
        )}>
          <IconTile icon={icon} tone={iconTone} variant={variant} />

          {/* Status / trailing — only show on top in vertical layout */}
          {!isHorizontal && (status || trailing) && (
            <div className="flex items-center gap-2 shrink-0">
              {renderStatus}
              {trailing}
            </div>
          )}
        </div>

        {/* Text content */}
        <div className={cn("flex-1 min-w-0", isHorizontal && "sm:order-2")}>
          {eyebrow && (
            <p className={cn("text-[10px] font-bold uppercase  mb-1.5", eyebrowColor)}>
              {eyebrow}
            </p>
          )}
          <h3 className={cn(
            "font-semibold leading-snug",
            isPromo ? "text-[14px] uppercase " : "text-[15px]",
            titleColor
          )}>
            {title}
          </h3>
          {description && (
            <p className={cn(
              "mt-1 leading-relaxed",
              isPromo ? "text-[12px]" : "text-[13px]",
              descriptionColor
            )}>
              {description}
            </p>
          )}

          {/* Inline status for horizontal layout */}
          {isHorizontal && status && <div className="mt-2">{renderStatus}</div>}
        </div>

        {/* Action slot */}
        {action && (
          <div className={cn(
            "shrink-0",
            isHorizontal ? "sm:order-3 w-full sm:w-auto" : "w-full"
          )}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
};
