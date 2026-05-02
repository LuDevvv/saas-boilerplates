import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils.js"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-label uppercase tracking-widest transition-all focus:outline-none focus:ring-4 focus:ring-[#004080]/10",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#004080] text-white hover:bg-[#003366] shadow-sm shadow-[#004080]/10",
        secondary:
          "border-transparent bg-[#00E6E6] text-[#004080] hover:bg-[#00CCCC] shadow-sm",
        destructive:
          "border-transparent bg-[#EF4F5F] text-white hover:bg-[#D44452] shadow-sm",
        outline: "border-[#E2E8F0] text-[#64748B] dark:border-[#FFFFFF]/10 dark:text-[#94A3B8] bg-transparent",
        success: "border-transparent bg-[#00E6E6]/10 text-[#004080] dark:text-[#00E6E6] hover:bg-[#00E6E6]/20",
        warning: "border-transparent bg-[#F4A524]/10 text-[#F4A524] hover:bg-[#F4A524]/20",
        info: "border-transparent bg-[#4D94DB]/10 text-[#4D94DB] hover:bg-[#4D94DB]/20",
        premium: "border-transparent bg-gradient-to-r from-[#004080] to-[#4D94DB] text-white shadow-md shadow-[#004080]/20",
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

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
