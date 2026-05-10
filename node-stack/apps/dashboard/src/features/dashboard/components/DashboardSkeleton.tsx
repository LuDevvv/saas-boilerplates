import { Skeleton } from "@node-stack/ui";
import { FC } from "react";

export const DashboardSkeleton: FC = () => (
  <div className="space-y-6 w-full">
    {/* Header row */}
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded-xl" />
        <Skeleton className="h-3.5 w-72 rounded-md" />
      </div>
      <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-[20px] border border-border bg-surface p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-9 rounded-[12px]" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-20 rounded-md" />
            <Skeleton className="h-7 w-14 rounded-lg" />
          </div>
        </div>
      ))}
    </div>

    {/* Main content grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Activity chart */}
      <div className="lg:col-span-2 rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-2.5 w-20" />
          </div>
          <Skeleton className="h-7 w-24 rounded-lg" />
        </div>
        <div className="p-5">
          <Skeleton className="h-[200px] w-full rounded-[12px]" />
        </div>
      </div>

      {/* Quick actions / onboarding */}
      <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]">
        <div className="px-5 py-4 border-b border-border-subtle">
          <Skeleton className="h-3.5 w-32" />
        </div>
        <div className="p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-[10px] shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-2.5 w-36 rounded-md" />
              </div>
              <Skeleton className="h-5 w-5 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Bottom cards */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]">
          <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-[10px]" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <div className="p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-[10px] shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 rounded-md" style={{ width: `${60 + (j * 20) % 40}%` }} />
                  <Skeleton className="h-2.5 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
