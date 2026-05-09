import { type ButtonHTMLAttributes } from "react";
import React from "react";

import { cn } from "../../utils.js";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ElementType | React.ReactNode;
}

const variantClasses = {
  primary:
    "bg-primary hover:bg-primary-600 text-primary-foreground shadow-[0_4px_14px_-2px_rgba(0,64,128,0.20)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.20)] hover:-translate-y-[1px] active:scale-95 transition-all duration-200",
  secondary:
    "bg-surface border border-border text-fg-secondary hover:bg-surface-hover hover:border-border-strong hover:text-fg active:scale-95 transition-all duration-200",
  outline:
    "bg-transparent border-2 border-primary text-primary hover:bg-primary/10 hover:-translate-y-[1px] active:scale-95 transition-all duration-200",
  ghost:
    "bg-transparent text-fg-secondary hover:bg-surface-hover hover:text-fg active:scale-95 transition-all duration-200",
  danger:
    "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/15 hover:border-red-300 dark:hover:border-red-500/30 active:scale-95 transition-all duration-200",
  success:
    "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/15 active:scale-95 transition-all duration-200",
};

const sizeClasses = {
  xs: "h-7 px-3 text-xs",
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm font-medium",
  lg: "h-14 px-10 text-base font-bold",
  icon: "h-11 w-11 flex items-center justify-center p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      icon,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 transition-all duration-300 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const sizeRounded = {
      xs: "rounded-lg",
      sm: "rounded-xl",
      md: "rounded-2xl",
      lg: "rounded-2xl",
      icon: "rounded-full",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          sizeRounded[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && icon && (
          <span className="flex items-center justify-center">
            {React.isValidElement(icon) ? (
              icon
            ) : (
              React.createElement(icon as React.ElementType, {
                className: "w-4 h-4",
              })
            )}
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";