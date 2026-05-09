import { FC } from "react";

import { cn } from "../../utils.js";

export type StatusPillTone = "success" | "warning" | "info" | "neutral" | "danger";

export interface StatusPillProps {
  /** Pill copy. Rendered uppercase. */
  label: string;
  /** Color tone. Defaults to "neutral". */
  tone?: StatusPillTone;
  /** When true, the leading dot pulses (use for live / active statuses). */
  pulse?: boolean;
  /** Hide the leading dot entirely. */
  hideDot?: boolean;
  className?: string;
}

// ─── Tone maps ───────────────────────────────────────────────────────────────

export const STATUS_TONE_CLASSES: Record<StatusPillTone, string> = {
  success: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  warning: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  info:    "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  danger:  "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20",
  neutral: "text-fg-muted bg-surface-hover border-border",
};

export const STATUS_DOT_CLASSES: Record<StatusPillTone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  info:    "bg-blue-500",
  danger:  "bg-red-500",
  neutral: "bg-fg-muted",
};

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Compact status indicator used for "active", "pending", "verified", etc.
 *
 * Supports an optional pulsing leading dot for live state.
 *
 * @example
 * <StatusPill label="Activado y seguro" tone="success" pulse />
 */
export const StatusPill: FC<StatusPillProps> = ({
  label,
  tone = "neutral",
  pulse = false,
  hideDot = false,
  className,
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border",
      STATUS_TONE_CLASSES[tone],
      className
    )}
  >
    {!hideDot && (
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          STATUS_DOT_CLASSES[tone],
          pulse && "animate-pulse"
        )}
      />
    )}
    {label}
  </span>
);
