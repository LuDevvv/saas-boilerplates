import React from "react";
import { Command } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * App logo — a rounded square with the brand Command icon.
 * Adapts automatically to light/dark mode.
 */
export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  return (
    <div
      className={`${sizes[size]} bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${className}`}
    >
      <Command className={`${iconSizes[size]} text-white dark:text-black`} />
    </div>
  );
}
