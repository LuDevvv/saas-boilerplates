import { cn } from "../../utils.js";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[#F1F5F9] dark:bg-[#FFFFFF]/5 rounded-xl",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
