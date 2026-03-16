import { cn } from "../lib/utils";

/**
 * Skeleton loading placeholder — uses rounded-xl corners for consistency.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
