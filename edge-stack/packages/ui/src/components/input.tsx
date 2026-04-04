import * as React from "react";
import { cn } from "../lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional icon rendered on the left side of the input */
  leftIcon?: React.ReactNode;
  /** Optional icon rendered on the right side of the input */
  rightIcon?: React.ReactNode;
  /** Visual error state — turns border red */
  error?: boolean;
}

/**
 * Input component with built-in password toggle, optional left/right icons,
 * and visual error state. Aligned to the EdgeStack design system.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="relative w-full group">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          type={inputType}
          className={cn(
            "flex h-12 w-full rounded-2xl border border-input bg-background/50 px-4 py-2 text-sm font-medium ring-offset-background transition-all duration-300",
            "placeholder:text-muted-foreground/60",
            "focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:bg-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "hover:border-border-hover hover:bg-background/80",
            leftIcon && "pl-11",
            (rightIcon || isPassword) && "pr-11",
            error &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/5",
            className,
          )}
          ref={ref}
          {...props}
        />
        {(rightIcon || isPassword) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {isPassword ? (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-foreground p-1 rounded-md transition-colors focus-visible:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
