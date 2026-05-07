import React, { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils.js";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
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
                "text-[11px] font-label uppercase  flex items-center gap-1.5 transition-colors duration-300",
                error
                  ? "text-[#EF4F5F]"
                  : "text-[#64748B] dark:text-[#94A3B8] group-focus-within:text-[#004080] dark:group-focus-within:text-[#00E6E6]"
              )}
            >
              {label}
              {required && <span className="text-[#EF4F5F]">*</span>}
            </span>
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-5 top-5 pointer-events-none z-10 text-[#64748B] group-focus-within:text-[#004080] transition-colors duration-300 dark:text-[#94A3B8] dark:group-focus-within:text-[#00E6E6]">
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
              "w-full pr-5 py-4",
              icon ? "pl-12" : "pl-5",
              "text-[14px] font-label text-fg", "bg-surface-muted",
              "border border-border-subtle rounded-2xl",
              "transition-all duration-300",
              "placeholder:text-[#64748B]/50 placeholder:font-body",
              "focus:outline-none focus:ring-4 focus:ring-[#004080]/5 focus:border-[#004080] dark:focus:border-[#00E6E6]",
              "resize-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-[#EF4F5F] focus:border-[#EF4F5F] ring-[#EF4F5F]/5"
                : "border-border-subtle focus:border-[#004080] dark:focus:border-[#00E6E6]",
              className
            )}
            {...props}
          />
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              "px-1 text-[11px] font-label uppercase  animate-in slide-in-from-top-1 duration-300",
              error ? "text-[#EF4F5F]" : "text-[#64748B] dark:text-[#94A3B8]"
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
