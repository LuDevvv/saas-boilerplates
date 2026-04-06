import React, { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@utils/classNames";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: any;
  required?: boolean;
  fullWidth?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      required,
      fullWidth = true,
      className = "",
      disabled,
      rows = 4,
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
            <span
              className={cn(
                "text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors duration-300",
                error
                  ? "text-red-500"
                  : "text-gray-400 dark:text-gray-500 group-focus-within:text-primary-500"
              )}
            >
              {label}
              {required && <span className="text-red-500">*</span>}
            </span>
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-4 pointer-events-none z-10 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300">
              {typeof icon === "function" ||
              (typeof icon === "object" && icon !== null && "render" in icon)
                ? React.createElement(icon as any, { className: "w-5 h-5" })
                : icon}
            </div>
          )}
          <textarea
            ref={ref}
            disabled={disabled}
            rows={rows}
            className={cn(
              "w-full pr-4 py-3.5",
              icon ? "pl-11" : "pl-4",
              "text-[15px] text-gray-900 dark:text-white",
              "bg-white dark:bg-gray-800/50",
              "border-2 rounded-2xl",
              "transition-all duration-300 ease-out-expo",
              "placeholder:text-gray-400/80 dark:placeholder:text-gray-500",
              "focus:outline-none",
              "resize-none",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-950",
              error
                ? "border-red-200 dark:border-red-900/50 focus:border-red-500 shadow-sm"
                : "border-gray-100 dark:border-gray-700/50 focus:border-primary-500 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm hover:shadow-md",
              className
            )}
            {...props}
          />
        </div>

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

TextArea.displayName = "TextArea";
