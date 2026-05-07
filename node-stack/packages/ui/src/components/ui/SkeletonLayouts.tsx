import { FC } from "react";
import { Skeleton } from "./Skeleton.js";
import { cn } from "../../utils.js";

/**
 * A standard card skeleton with a header and grid content.
 * Moldable for various dashboard sections.
 */
export const CardSkeleton: FC<{ className?: string; rows?: number }> = ({ 
  className, 
  rows = 4 
}) => (
  <div className={cn(
    "p-6 bg-surface border border-border-subtle rounded-[20px] shadow-sm space-y-8",
    className
  )}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-44 rounded-md" />
          <Skeleton className="h-2.5 w-32 rounded-md opacity-50" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-5">
          <Skeleton className="h-10 w-10 rounded-full shrink-0 opacity-30" />
          <div className="space-y-2.5 flex-1">
            <Skeleton className="h-2 w-16 rounded-sm opacity-40" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * A standard form skeleton with input field placeholders.
 */
export const FormSkeleton: FC<{ className?: string; fields?: number }> = ({ 
  className,
  fields = 3
}) => (
  <div className={cn(
    "p-6 space-y-6 bg-surface backdrop-blur-md border border-border-subtle rounded-[20px] shadow-sm",
    className
  )}>
    <div className="flex items-center gap-4 border-b border-border-subtle pb-5">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-40 rounded-md" />
        <Skeleton className="h-2.5 w-24 rounded-md opacity-50" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-20 rounded-sm ml-1" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ))}
    </div>

    <div className="pt-5 flex justify-end gap-3">
      <Skeleton className="h-11 w-28 rounded-lg" />
      <Skeleton className="h-11 w-36 rounded-lg" />
    </div>
  </div>
);
