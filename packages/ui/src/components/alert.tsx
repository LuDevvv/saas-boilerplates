import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

/**
 * Alert component variants for status feedback messages.
 * Supports default (info), success, warning, and destructive.
 */
const alertVariants = cva(
  "relative flex items-start gap-3 w-full rounded-xl border p-4 text-sm font-medium transition-all [&>svg]:shrink-0 [&>svg]:mt-0.5",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "bg-destructive/5 border-destructive/20 text-destructive [&>svg]:text-destructive",
        success:
          "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 [&>svg]:text-emerald-500",
        warning:
          "bg-amber-500/5 border-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 [&>svg]:text-amber-500",
        info: "bg-blue-500/5 border-blue-500/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 [&>svg]:text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/** Icon mapping for each alert variant */
const alertIcons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

export interface AlertProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Whether to show the variant icon automatically */
  showIcon?: boolean;
}

/**
 * Alert banner for displaying status feedback messages.
 * Automatically shows the appropriate icon based on variant.
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    { className, variant = "default", showIcon = true, children, ...props },
    ref,
  ) => {
    const IconComponent = alertIcons[variant || "default"];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {showIcon && <IconComponent className="h-4 w-4" />}
        <div className="flex-1">{children}</div>
      </div>
    );
  },
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-0.5 font-bold leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-medium opacity-90", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };
