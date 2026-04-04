import * as React from "react";
import { cn } from "../lib/utils";

export interface FormFieldProps {
  /** Label text */
  label?: string;
  /** Optional description below the label */
  description?: string;
  /** Error message string — when present, shows the error state */
  error?: string;
  /** The form control (Input, Select, Textarea, etc.) */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** HTML for attribute linking label to input */
  htmlFor?: string;
}

/**
 * FormField wrapper — provides consistent field layout with label, optional description,
 * error message display, and proper spacing. Use this to wrap Inputs, Selects, Textareas.
 *
 * @example
 * ```tsx
 * <FormField label="Email" error={errors.email?.message} htmlFor="email">
 *     <Input id="email" type="email" error={!!errors.email} />
 * </FormField>
 * ```
 */
function FormField({
  label,
  description,
  error,
  children,
  className,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="space-y-0.5">
          <label
            htmlFor={htmlFor}
            className={cn(
              "text-sm font-medium leading-none",
              error && "text-destructive",
            )}
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-muted-foreground font-medium">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
      {error && (
        <p className="text-xs font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}

export { FormField };
