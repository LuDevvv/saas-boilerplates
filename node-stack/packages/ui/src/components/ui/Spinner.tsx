import { FC } from "react";

import { cn } from "../../utils.js";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "muted" | "secondary";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-[3px]",
  xl: "w-16 h-16 border-4",
} as const;

const colorClasses = {
  primary:   "border-primary border-t-transparent",
  secondary: "border-secondary border-t-transparent",
  white:     "border-white border-t-transparent",
  muted:     "border-fg-muted border-t-transparent",
} as const;

export const Spinner: FC<SpinnerProps> = ({
  size = "md",
  color = "primary",
  className,
}) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Cargando"
    />
  );
};
