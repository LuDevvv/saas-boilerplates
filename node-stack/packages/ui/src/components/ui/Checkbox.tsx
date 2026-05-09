import { Check } from "lucide-react";
import React from "react";

import { cn } from "../../utils.js";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  helperText?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className: _className, label, helperText, error, ...props }, ref) => {
    return (
      <div className="group flex flex-col gap-1.5">
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <div className="relative flex items-center mt-0.5">
            <input
              type="checkbox"
              className="sr-only peer"
              ref={ref}
              {...props}
            />
            <div
              className={cn(
                "w-5 h-5 rounded-[8px] border border-border transition-all duration-300 flex items-center justify-center shadow-sm active:scale-90",
                "bg-white dark:bg-canvas-dark",
                "peer-checked:border-primary peer-checked:bg-primary dark:peer-checked:bg-primary",
                "group-hover:border-primary/60 dark:group-hover:border-primary/40",
                "peer-focus-visible:ring-4 peer-focus-visible:ring-primary/10",
                "peer-checked:[&_svg]:opacity-100 peer-checked:[&_svg]:scale-100",
                error &&
                  "border-danger peer-checked:bg-danger peer-checked:border-danger"
              )}
            >
              <Check
                className="w-3.5 h-3.5 text-white transition-all duration-300 opacity-0 scale-50"
                strokeWidth={4}
              />
            </div>
          </div>

          {(label || helperText) && (
            <div className="flex flex-col mt-0.5">
              {label && (
                <span className="text-[13px] font-medium text-fg-secondary transition-colors group-hover:text-primary dark:group-hover:text-white">
                  {label}
                </span>
              )}
              {helperText && (
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-tight">
                  {helperText}
                </p>
              )}
            </div>
          )}
        </label>

        {error && (
          <p className="px-1 text-[12px] font-medium text-danger animate-in fade-in slide-in-from-top-1 duration-300">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
