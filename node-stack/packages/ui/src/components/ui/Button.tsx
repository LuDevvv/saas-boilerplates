import { type ButtonHTMLAttributes, type FC, type Ref } from "react";
import React from "react";
import { cn } from "../../utils.js";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: unknown;
}

const variantClasses = {
  primary:
    "bg-primary text-white hover:bg-primary/90 shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 active:scale-95 active:translate-y-0",
  secondary:
    "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 shadow-sm dark:bg-[#1A1A1A] dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5",
  outline:
    "bg-transparent border-2 border-primary text-primary hover:bg-primary/5 active:scale-95 dark:border-primary-light dark:text-primary-light dark:hover:bg-primary-light/5",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 active:scale-95 dark:text-gray-400 dark:hover:bg-white/5",
  danger:
    "bg-danger text-white hover:bg-danger/90 active:scale-95 shadow-premium hover:shadow-premium-hover",
  success:
    "bg-success text-white hover:bg-success/90 active:scale-95 shadow-premium hover:shadow-premium-hover",
};

const sizeClasses = {
  xs: "h-7 px-3 text-xs",
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-5 text-sm font-medium",
  lg: "h-12 px-8 text-base font-medium",
  icon: "h-10 w-10 flex items-center justify-center p-0",
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
      "inline-flex items-center justify-center gap-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const sizeRounded = {
      xs: "rounded-md",
      sm: "rounded-lg",
      md: "rounded-xl",
      lg: "rounded-xl",
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
            {typeof icon === "function" ||
            (typeof icon === "object" && icon !== null && "render" in icon)
              ? React.createElement(icon as unknown as { render: unknown }, { className: "w-4 h-4" })
              : (icon as React.ReactNode)}
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";