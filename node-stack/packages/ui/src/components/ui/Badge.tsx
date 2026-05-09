import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "../../utils.js"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase transition-all focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15",
        secondary:
          "border-border bg-surface-muted text-fg-secondary hover:bg-surface-hover",
        destructive:
          "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/15",
        outline: "border-border text-fg-secondary bg-transparent hover:bg-surface-hover",
        success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15",
        warning: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15",
        info: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/15",
        premium: "border-primary/30 bg-primary/15 text-primary hover:bg-primary/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps): JSX.Element {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
