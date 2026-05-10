import { cn } from "../../utils.js";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        "bg-surface-muted rounded-xl",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
