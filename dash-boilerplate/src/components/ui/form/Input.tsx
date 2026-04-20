import type { InputHTMLAttributes } from "react";
import React, { forwardRef } from "react";
import { cn } from "@utils/classNames";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  icon?: any;
  required?: boolean;
  fullWidth?: boolean;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      icon,
      required,
      fullWidth = true,
      rightElement,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          "group flex flex-col gap-2",
          fullWidth ? "w-full" : "w-fit"
        )}
      >
        {label && (
          <label className="flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-primary-500 dark:text-gray-500">
              {label}
              {required && <span className="text-red-500">*</span>}
            </span>
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-primary-500">
              {typeof icon === "function" ||
              (typeof icon === "object" && icon !== null && "render" in icon)
                ? React.createElement(icon as any, { className: "w-5 h-5" })
                : icon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full py-3.5",
              rightElement ? "pr-20" : "pr-11", // Space for validation icon and right element on right
              icon ? "pl-11" : "pl-4",
              "text-[15px] text-gray-900 dark:text-white",
              "bg-gray-50/50 focus:bg-white dark:bg-white/[0.03] dark:focus:bg-gray-950/50",
              "border-2 rounded-2xl",
              "transition-all duration-500 ease-out-expo",
              "placeholder:text-gray-400/80 dark:placeholder:text-gray-500",
              "focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-950",
              error
                ? "border-red-200 dark:border-red-900/50 focus:border-red-500 shadow-sm"
                : success
                ? "border-green-200 dark:border-green-900/50 focus:border-green-500 shadow-sm"
                : "border-transparent dark:border-white/[0.05] focus:border-primary-500/50 hover:border-primary-500/20 shadow-sm hover:shadow-md",
              className
            )}
            {...props}
          />

          {/* Validation Icons & Right Element */}
          <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2 text-gray-400">
            {rightElement && (
              <div className="flex items-center">{rightElement}</div>
            )}
            {(error || success) && (
              <div className="pointer-events-none flex items-center">
                {error ? (
                  <AlertCircle className="animate-in zoom-in size-5 text-red-500 duration-300" />
                ) : (
                  <CheckCircle2 className="animate-in zoom-in size-5 text-green-500 duration-300" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Support Text */}
        {(error || helperText) && (
          <p
            className={cn(
              "px-1 text-xs font-medium animate-in slide-in-from-top-1 duration-300",
              error ? "text-red-500" : "text-gray-400 dark:text-gray-500"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
