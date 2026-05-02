import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../utils.js";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  helperText?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, helperText, error, ...props }, ref) => {
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
                "w-5 h-5 rounded-[6px] border border-gray-200 dark:border-white/10 transition-all duration-200 flex items-center justify-center shadow-sm",
                "bg-white dark:bg-[#1A1A1A]",
                "peer-checked:border-primary peer-checked:bg-primary dark:peer-checked:bg-primary-light dark:peer-checked:border-primary-light",
                "group-hover:border-primary/60 dark:group-hover:border-primary-light/40",
                "peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20",
                "peer-checked:[&_svg]:opacity-100 peer-checked:[&_svg]:scale-100",
                error &&
                  "border-danger peer-checked:bg-danger peer-checked:border-danger"
              )}
            >
              <Check
                className="w-3.5 h-3.5 text-white dark:text-gray-900 transition-all duration-200 opacity-0 scale-50"
                strokeWidth={4}
              />
            </div>
          </div>

          {(label || helperText) && (
            <div className="flex flex-col mt-0.5">
              {label && (
                <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 transition-colors group-hover:text-primary dark:group-hover:text-white">
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
          <p className="px-1 text-[10px] font-label text-[#EF4F5F] uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
