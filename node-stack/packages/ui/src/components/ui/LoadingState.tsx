import { FC } from "react";

import { Skeleton } from "./Skeleton.js";
import { Spinner } from "./Spinner.js";
import { cn } from "../../utils.js";

export type LoadingVariant = "spinner" | "skeleton" | "shimmer";

export interface LoadingStateProps {
  /** Visual treatment. Defaults to "spinner". */
  variant?: LoadingVariant;
  /** Message rendered next to (or below) the indicator. Spinner-only. */
  message?: string;
  /** Spinner size. Spinner-only. */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Number of skeleton lines / shimmer rows. Skeleton/shimmer-only.
   * Defaults: skeleton=3, shimmer=4.
   */
  rows?: number;
  /** Custom container classes (padding, alignment). */
  className?: string;
}

// ─── Skeleton variant ────────────────────────────────────────────────────────

const SkeletonLines: FC<{ rows: number }> = ({ rows }) => {
  // Vary widths to feel natural: full / 5/6 / 2/3 / 4/5 / 1/2 ...
  const widths = ["w-full", "w-5/6", "w-2/3", "w-4/5", "w-1/2", "w-3/4"];
  return (
    <div className="w-full space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4 animate-pulse", widths[i % widths.length])}
        />
      ))}
    </div>
  );
};

// ─── Shimmer variant ─────────────────────────────────────────────────────────

const ShimmerBlocks: FC<{ rows: number }> = ({ rows }) => (
  <div className="w-full space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse bg-surface-muted rounded-md border border-border-subtle h-12"
      />
    ))}
  </div>
);

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Unified loading state component with three variants:
 *
 * - `spinner` (default): centered animated spinner with optional message.
 *   Use for full-screen / page-level waiting.
 * - `skeleton`: stacked animated skeleton lines with varied widths.
 *   Use to suggest the shape of incoming text content (lists, paragraphs).
 * - `shimmer`: stacked solid blocks with subtle pulse.
 *   Use for card / row placeholders where line shape isn't relevant.
 *
 * @example
 * <LoadingState />
 * <LoadingState variant="skeleton" rows={5} />
 * <LoadingState variant="shimmer" />
 * <LoadingState variant="spinner" size="lg" message="Cargando reportes..." />
 */
export const LoadingState: FC<LoadingStateProps> = ({
  variant = "spinner",
  message = "Cargando...",
  size = "md",
  rows,
  className,
}) => {
  if (variant === "skeleton") {
    return (
      <div className={cn("w-full", className)} role="status" aria-busy="true">
        <SkeletonLines rows={rows ?? 3} />
      </div>
    );
  }

  if (variant === "shimmer") {
    return (
      <div className={cn("w-full", className)} role="status" aria-busy="true">
        <ShimmerBlocks rows={rows ?? 4} />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center py-8 px-4 gap-3",
        className
      )}
    >
      <Spinner size={size} />
      {message && <p className="text-sm text-fg-secondary">{message}</p>}
    </div>
  );
};

LoadingState.displayName = "LoadingState";
