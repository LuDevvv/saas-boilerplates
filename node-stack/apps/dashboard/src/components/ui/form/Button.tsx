import { type ButtonHTMLAttributes, type FC } from "react";
import React from "react";
import { cn } from "@utils/classNames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: any; // Accept any to support LucideIcon | ReactNode | undefined
}

const variantClasses = {
  primary:
    "bg-gradient-to-r from-primary-500 to-highlight-500 text-white hover:from-primary-600 hover:to-highlight-600 focus:ring-primary-500/50 shadow-primary-500/20",
  secondary:
    "bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 focus:ring-gray-500/50 shadow-gray-500/20",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300 dark:text-gray-300 dark:hover:bg-gray-800 shadow-none hover:shadow-none",
  danger:
    "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 focus:ring-red-500/50 shadow-red-500/20",
  success:
    "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 focus:ring-green-500/50 shadow-green-500/20",
};

const sizeClasses = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
  icon: "p-2",
};

export const Button: FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  icon,
  disabled,
  className,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm hover:shadow-md";

  const sizeRounded = {
    xs: "rounded-lg",
    sm: "rounded-xl",
    md: "rounded-2xl",
    lg: "rounded-2xl",
    icon: "rounded-full",
  };

  return (
    <button
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
            ? React.createElement(icon as any, { className: "w-4 h-4" }) // If it's a component
            : icon // If it's already a React node
          }
        </span>
      )}
      {children}
    </button>
  );
};
