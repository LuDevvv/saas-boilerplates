import { Skeleton, FormSkeleton, CardSkeleton } from "@node-stack/ui";
import { FC } from "react";

export { FormSkeleton, CardSkeleton };

export const ProfileHeroSkeleton: FC = () => (
  <div className="mb-6">
    {/* Banner Skeleton - Responsive height match */}
    <div className="h-44 sm:h-52 md:h-56 w-full rounded-[32px] bg-slate-100 dark:bg-slate-800/40 overflow-hidden relative border border-slate-200 dark:border-white/5">
      {/* Content anchored to bottom - Precise padding match px-5 sm:px-12 */}
      <div className="absolute bottom-0 inset-x-0 px-5 sm:px-8 md:px-12 pb-5 sm:pb-6 flex items-end gap-4 sm:gap-6">
        {/* Avatar Circle Skeleton - Exact dimensions */}
        <div className="relative shrink-0">
          <Skeleton className="h-[72px] w-[72px] sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full border-[3px] border-white/20" />
        </div>
        
        {/* User Info Text Skeleton */}
        <div className="flex-1 flex flex-col gap-2.5 mb-2 sm:mb-1.5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-32 sm:h-8 sm:w-56 rounded-lg" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-40 sm:w-64 rounded-md opacity-60" />
        </div>

        {/* Action Button Skeleton - Visible only on sm+ per ProfileHero logic */}
        <div className="hidden sm:block mb-2">
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

export const DetailsCardSkeleton: FC = () => (
  <CardSkeleton rows={4} />
);

export const AuditLogSkeleton: FC = () => (
  <div className="p-6 bg-surface border border-border-subtle rounded-[20px] shadow-sm space-y-6">
    <div className="flex items-center gap-4 border-b border-border-subtle pb-5">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-56 rounded-md" />
        <Skeleton className="h-2.5 w-24 rounded-md opacity-50" />
      </div>
    </div>
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 dark:border-white/5">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <Skeleton className="h-2.5 w-32 rounded-md opacity-50" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SidebarWidgetSkeleton: FC = () => (
  <div className="p-6 bg-surface border border-border-subtle rounded-[20px] shadow-sm space-y-5">
    <Skeleton className="h-4 w-36 rounded-md mb-2" />
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-muted border border-border-subtle">
          <Skeleton className="h-3 w-20 rounded-sm" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      ))}
    </div>
  </div>
);

export const ProfileLayoutSkeleton: FC = () => (
  <div className="space-y-6 w-full mx-auto">
    <ProfileHeroSkeleton />
    
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Primary Column (8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <DetailsCardSkeleton />
        <AuditLogSkeleton />
      </div>

      {/* Secondary Column (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <SidebarWidgetSkeleton />
        <Skeleton className="h-60 w-full rounded-[20px] bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-white/5 dark:to-white/[0.02]" />
      </div>
    </div>
  </div>
);

