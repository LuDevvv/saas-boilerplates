import * as React from "react";
import { cn } from "../lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visual error state — turns border red */
  error?: boolean;
}

/**
 * Textarea component — matches Input styling (rounded-xl, h-12 baseline, border-on-focus).
 * Auto-adjustable height via CSS or manual rows.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium ring-offset-background transition-all duration-200",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:border-foreground focus-visible:ring-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none",
          error && "border-destructive focus-visible:border-destructive",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
