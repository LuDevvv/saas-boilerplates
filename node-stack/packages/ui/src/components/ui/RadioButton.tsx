import { FC, InputHTMLAttributes, ReactNode } from "react";

import { cn } from "../../utils.js";

interface RadioButtonProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  required?: boolean;
}

export const RadioButton: FC<RadioButtonProps> = ({
  label,
  error,
  helperText,
  icon,
  required,
  className = "",
  checked,
  onChange,
  disabled,
  ...props
}) => {
  return (
    <div className={cn("group flex flex-col gap-1.5", className)}>
      <label
        className={cn(
          "inline-flex items-center gap-3 cursor-pointer",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <div className="relative flex items-center justify-center">
          <input
            type="radio"
            className="sr-only peer"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            {...props}
          />

          {/* Visual Radio */}
          <div
            className={cn(
              "w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center shadow-sm",
              "peer-focus:ring-4 peer-focus:ring-primary/10",
              checked
                ? "bg-white dark:bg-canvas-dark border-primary shadow-primary/10 scale-100 active:scale-90"
                : "bg-white dark:bg-canvas-dark border-border hover:border-primary/20 scale-100 active:scale-90",
              error &&
                "border-danger peer-focus:ring-danger/10"
            )}
          >
            {/* Dot */}
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full bg-primary transition-all duration-300 transform",
                checked
                  ? "opacity-100 scale-100 shadow-glow"
                  : "opacity-0 scale-0"
              )}
            />
          </div>
        </div>

        {(label || icon) && (
          <div className="flex flex-col">
            <span
              className={cn(
                "text-sm font-label flex items-center gap-2 transition-colors duration-300",                checked
                  ? "text-fg"
                  : "text-gray-600 dark:text-gray-400 group-hover:text-[var(--primary)]",
                error && "text-red-500"
              )}
            >
              {icon && <span className="text-gray-400">{icon}</span>}
              {label}
              {required && <span className="text-red-500">*</span>}
            </span>
          </div>
        )}
      </label>

      {(error || helperText) && (
        <div className="mt-0.5 px-1 ml-9">
          <p
            className={cn(
              "text-xs font-label animate-in fade-in slide-in-from-left-1 duration-300",
              error ? "text-red-500" : "text-fg-secondary"
            )}
          >
            {error || helperText}
          </p>
        </div>
      )}
    </div>
  );
};
;
