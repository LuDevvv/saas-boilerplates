import React from "react";
import { cn } from "../../utils.js";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "gray" | "secondary";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  color = "primary",
  className,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-[3px]",
    xl: "w-16 h-16 border-4",
  };

  const colorClasses = {
    primary: "border-[#004080] border-t-transparent",
    secondary: "border-[#00E6E6] border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-[#64748B] border-t-transparent",
  };

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
