import type { InputHTMLAttributes } from "react";
import React, { forwardRef } from "react";
import { cn } from "../../utils.js";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  icon?: any;
  required?: boolean;
  fullWidth?: boolean;
  rightElement?: React.ReactNode;
  labelRight?: React.ReactNode;
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
      labelRight,
      className = "",
      disabled,
      type = "text",
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
        {(label || labelRight) && (
          <label className="flex items-baseline justify-between px-1 mb-1.5">
            {label ? (
              <span className="text-[13px] font-medium text-fg-secondary transition-colors group-focus-within:text-primary">
                {label}
                {required && <span className="text-danger ml-1">*</span>}
              </span>
            ) : <span />}
            {labelRight && <div>{labelRight}</div>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 pointer-events-none text-fg-muted group-focus-within:text-primary transition-colors duration-300 flex items-center justify-center">
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<any>, {
                  size: 15,
                  className: cn("w-[15px] h-[15px]", (icon as React.ReactElement<any>).props?.className)
                })
                : (typeof icon === "function" || (typeof icon === "object" && icon !== null && ("render" in icon || "$$typeof" in icon)))
                  ? React.createElement(icon as any, { size: 15, className: "w-[15px] h-[15px]" })
                  : icon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            type={type}
            className={cn(
              "flex h-12 w-full py-2 text-sm font-medium text-fg outline-none transition-all duration-300",
              rightElement || error || success ? "pr-12" : "pr-4",
              icon ? "pl-11" : "pl-6",
              "bg-surface-muted",
              "border border-border rounded-xl",
              "placeholder:text-fg-muted placeholder:font-normal",
              "focus:outline-none focus:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-danger focus:border-danger"
                : "",
              className
            )}
            {...props}
          />

          <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2">
            {rightElement && (
              <div className="flex items-center">{rightElement}</div>
            )}
            {(error || success) && (
              <div className="pointer-events-none flex items-center">
                {error ? (
                  <AlertCircle className="w-5 h-5 text-danger animate-in zoom-in duration-300" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-success animate-in zoom-in duration-300" />
                )}
              </div>
            )}
          </div>
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              "px-1 text-[12px] font-medium animate-in fade-in slide-in-from-top-1 duration-300",
              error ? "text-danger" : "text-fg-muted"
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