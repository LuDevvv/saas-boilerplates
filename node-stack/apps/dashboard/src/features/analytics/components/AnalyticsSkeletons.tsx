import { FC } from "react";
import { Skeleton } from "@node-stack/ui";

// ─── KPI cards row ────────────────────────────────────────────────────────────

const KpiCardSkeleton: FC = () => (
  <div className="rounded-[20px] border border-border bg-white dark:bg-surface p-5 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-3.5 w-24 rounded-lg" />
      <Skeleton className="h-8 w-8 rounded-[10px]" />
    </div>
    <Skeleton className="h-8 w-28 rounded-xl" />
    <div className="flex items-center gap-2">
      <Skeleton className="h-5 w-12 rounded-md" />
      <Skeleton className="h-3.5 w-24 rounded-md" />
    </div>
    <Skeleton className="h-11 w-full rounded-lg" />
  </div>
);

// ─── Trend chart ──────────────────────────────────────────────────────────────

const TrendChartSkeleton: FC = () => (
  <div className="rounded-[20px] border border-border bg-white dark:bg-surface p-5 space-y-5 h-full">
    <div className="flex items-start justify-between">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-44 rounded-lg" />
        <Skeleton className="h-3.5 w-56 rounded-md" />
      </div>
      <div className="space-y-2 items-end flex flex-col">
        <div className="flex gap-3">
          <Skeleton className="h-3.5 w-14 rounded-md" />
          <Skeleton className="h-3.5 w-16 rounded-md" />
        </div>
        <Skeleton className="h-8 w-40 rounded-[10px]" />
      </div>
    </div>
    <Skeleton className="h-[200px] w-full rounded-xl" />
  </div>
);

// ─── Donut widget ─────────────────────────────────────────────────────────────

const DonutWidgetSkeleton: FC = () => (
  <div className="rounded-[20px] border border-border bg-white dark:bg-surface p-5 space-y-5 h-full">
    <Skeleton className="h-4 w-36 rounded-lg" />
    <div className="flex items-center justify-center">
      <Skeleton className="h-[160px] w-[160px] rounded-full" />
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-3.5 w-24 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-1.5 w-16 rounded-full" />
            <Skeleton className="h-3.5 w-9 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Bar widget ───────────────────────────────────────────────────────────────

const BarWidgetSkeleton: FC = () => (
  <div className="rounded-[20px] border border-border bg-white dark:bg-surface p-5 space-y-4 h-full">
    <div className="flex items-start justify-between">
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-28 rounded-lg" />
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-7 w-24 rounded-xl" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-3.5 w-12 rounded-md" />
        <Skeleton className="h-3.5 w-14 rounded-md" />
      </div>
    </div>
    <Skeleton className="h-[160px] w-full rounded-xl" />
  </div>
);

// ─── Top sources widget ───────────────────────────────────────────────────────

const TopSourcesSkeleton: FC = () => (
  <div className="rounded-[20px] border border-border bg-white dark:bg-surface p-5 space-y-4 h-full">
    <Skeleton className="h-4 w-40 rounded-lg" />
    <div className="flex items-center gap-3">
      <Skeleton className="flex-1 h-3 rounded-md opacity-50" />
      <Skeleton className="w-20 h-3 rounded-md opacity-50" />
      <Skeleton className="w-14 h-3 rounded-md opacity-50" />
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Skeleton className="h-3.5 w-4 rounded-md" />
              <Skeleton className="h-5 w-5 rounded-[6px]" />
              <Skeleton className="h-3.5 flex-1 rounded-md" />
            </div>
            <Skeleton className="h-3.5 w-20 rounded-md" />
            <Skeleton className="h-3.5 w-14 rounded-md" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full ml-[26px]" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Full analytics layout skeleton ──────────────────────────────────────────

export const AnalyticsLayoutSkeleton: FC = () => (
  <div className="space-y-6 pb-10 animate-in fade-in duration-300">
    {/* Header */}
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-7 w-40 rounded-xl" />
        <Skeleton className="h-4 w-64 rounded-lg" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-40 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>

    {/* KPI cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <KpiCardSkeleton key={i} />)}
    </div>

    {/* Trend + Donut */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2"><TrendChartSkeleton /></div>
      <DonutWidgetSkeleton />
    </div>

    {/* Bar + Sources */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BarWidgetSkeleton />
      <TopSourcesSkeleton />
    </div>
  </div>
);
