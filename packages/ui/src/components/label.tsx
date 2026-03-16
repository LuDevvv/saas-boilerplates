import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * Label variants for form fields.
 * Uses medium weight by default. Supports an error state.
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors",
);

export interface LabelProps
  extends
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  /** Whether this label is for a field in an error state */
  error?: boolean;
  /** Optional description text rendered below the label */
  description?: string;
}

/**
 * Accessible form label built on Radix UI Label.
 * Supports error styling and an optional description sub-text.
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, error, description, children, ...props }, ref) => (
  <div className="space-y-1">
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), error && "text-destructive", className)}
      {...props}
    >
      {children}
    </LabelPrimitive.Root>
    {description && (
      <p className="text-xs text-muted-foreground font-medium">{description}</p>
    )}
  </div>
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
