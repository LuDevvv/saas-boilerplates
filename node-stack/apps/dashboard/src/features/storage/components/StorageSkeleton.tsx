import { Skeleton } from "@node-stack/ui";
import { FC } from "react";

export const StorageSkeleton: FC = () => (
  <div className="space-y-6 w-full">
    {/* Header */}
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24 rounded-md" />
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-3.5 w-80 rounded-md" />
      </div>
      <Skeleton className="h-10 w-36 rounded-xl shrink-0" />
    </div>

    {/* Dropzone */}
    <Skeleton className="h-[90px] w-full rounded-[20px]" />

    {/* Two-column layout */}
    <div className="flex gap-6">
      {/* Main: filters + grid */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-24 rounded-lg" />)}
          </div>
          <Skeleton className="h-10 w-[260px] rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-[16px] border border-border bg-surface p-3 space-y-2.5">
              <Skeleton className="h-32 w-full rounded-[10px]" />
              <Skeleton className="h-3 w-3/4 rounded-md" />
              <Skeleton className="h-2.5 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      {/* Aside: stats */}
      <div className="w-[260px] shrink-0 space-y-4">
        <div className="rounded-[20px] border border-border bg-surface p-5 space-y-4">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-3 w-12 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[20px] border border-border bg-surface p-5 space-y-3">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-16 w-full rounded-[12px]" />
        </div>
      </div>
    </div>
  </div>
);
