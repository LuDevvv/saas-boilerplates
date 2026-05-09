import { Skeleton } from "@node-stack/ui";
import { FC } from "react";

// ─── Members list section ─────────────────────────────────────────────────────

const MembersListSkeleton: FC = () => (
  <div className="rounded-[20px] border border-border bg-white dark:bg-surface overflow-hidden">
    {/* Column header */}
    <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 border-b border-border bg-gray-50/50 dark:bg-white/[0.02]">
      <Skeleton className="flex-1 h-3 rounded-md opacity-50" />
      <Skeleton className="w-[120px] h-3 rounded-md opacity-50" />
      <Skeleton className="hidden md:block w-24 h-3 rounded-md opacity-50" />
      <div className="w-8" />
    </div>
    {/* Member rows */}
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-b-0 animate-pulse">
        <div className="h-9 w-9 rounded-full bg-surface-hover shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-28 rounded-lg" />
            {i === 0 && <Skeleton className="h-4 w-6 rounded-md" />}
          </div>
          <Skeleton className="h-3 w-40 rounded-md" />
        </div>
        <Skeleton className="hidden sm:block h-5 w-20 rounded-full" />
        <Skeleton className="hidden md:block h-3.5 w-16 rounded-md" />
        <div className="w-8 shrink-0" />
      </div>
    ))}
  </div>
);

// ─── Right side panel ─────────────────────────────────────────────────────────

const RolesPanelSkeleton: FC = () => (
  <div className="rounded-[20px] border border-border bg-white dark:bg-surface p-5 space-y-5">
    {/* Header */}
    <div className="flex items-center gap-3 pb-4 border-b border-border">
      <Skeleton className="h-9 w-9 rounded-[11px]" />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-16 rounded-lg" />
        <Skeleton className="h-3.5 w-24 rounded-md" />
      </div>
    </div>
    {/* Role items */}
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-start gap-3">
        <Skeleton className="h-7 w-7 rounded-[8px] shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-24 rounded-md" />
          <Skeleton className="h-3 w-40 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

const SummarySkeleton: FC = () => (
  <div className="rounded-[20px] border border-border bg-white dark:bg-surface p-5 space-y-3">
    <Skeleton className="h-3 w-20 rounded-full" />
    {[1, 2].map(i => (
      <div key={i} className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 rounded-md" />
        <Skeleton className="h-3.5 w-6 rounded-md" />
      </div>
    ))}
  </div>
);

const UpgradeCardSkeleton: FC = () => (
  <Skeleton className="h-[160px] rounded-[20px]" />
);

// ─── Full members layout skeleton ─────────────────────────────────────────────

export const MembersLayoutSkeleton: FC = () => (
  <div className="space-y-6 pb-10 animate-in fade-in duration-300">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-xl" />
        <Skeleton className="h-4 w-56 rounded-lg" />
      </div>
      <Skeleton className="hidden sm:block h-10 w-36 rounded-xl" />
    </div>

    {/* Content grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: list */}
      <div className="lg:col-span-2 space-y-3">
        <Skeleton className="h-11 w-full rounded-xl" />
        <MembersListSkeleton />
      </div>

      {/* Right: side panel */}
      <div className="space-y-4">
        <RolesPanelSkeleton />
        <SummarySkeleton />
        <UpgradeCardSkeleton />
      </div>
    </div>
  </div>
);
