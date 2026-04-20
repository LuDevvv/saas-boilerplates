import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/classNames";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
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
            {/* Custom Checkbox Box */}
            <div
              className={cn(
                "w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center",
                "border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900",
                "peer-checked:border-primary-500 peer-checked:bg-primary-500",
                "group-hover:border-primary-400 dark:group-hover:border-primary-500/50",
                "peer-focus:ring-4 peer-focus:ring-primary-500/10",
                "peer-checked:[&_svg]:opacity-100 peer-checked:[&_svg]:scale-100",
                error &&
                  "border-red-500 peer-checked:bg-red-500 peer-checked:border-red-500"
              )}
            >
              <Check
                className="w-3.5 h-3.5 text-white transition-all duration-200 opacity-0 scale-50"
                strokeWidth={4}
              />
            </div>
          </div>

          {(label || helperText) && (
            <div className="flex flex-col">
              {label && (
                <span className="text-sm font-bold text-gray-900 dark:text-white transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {label}
                </span>
              )}
              {helperText && (
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  {helperText}
                </p>
              )}
            </div>
          )}
        </label>

        {error && (
          <p className="px-1 text-[10px] font-bold text-red-500 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
