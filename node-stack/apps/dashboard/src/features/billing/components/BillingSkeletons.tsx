import { Skeleton } from "@node-stack/ui";
import { FC } from "react";

// ─── PlanCard skeleton ────────────────────────────────────────────────────────

export const PlanCardSkeleton: FC = () => (
  <div className="rounded-[20px] border border-border bg-white dark:bg-surface overflow-hidden">
    {/* Section header */}
    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
      <Skeleton className="h-4 w-36 rounded-lg" />
      <Skeleton className="h-4 w-14 rounded-lg" />
    </div>

    {/* Current plan section */}
    <div className="px-5 py-5 border-b border-border bg-gray-50/60 dark:bg-white/[0.025]">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-6 w-28 rounded-lg mb-1.5" />
      <Skeleton className="h-3.5 w-44 rounded-md mb-4" />
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <Skeleton className="h-3 w-32 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <Skeleton className="h-3 w-28 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-7 w-24 rounded-lg" />
    </div>

    {/* Other plan rows */}
    {[1, 2].map((i) => (
      <div
        key={i}
        className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border last:border-b-0"
      >
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-20 rounded-lg" />
          <Skeleton className="h-3 w-36 rounded-md" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-5 w-14 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-[10px]" />
        </div>
      </div>
    ))}
  </div>
);

// ─── PaymentMethodCard skeleton ───────────────────────────────────────────────

export const PaymentMethodCardSkeleton: FC = () => (
  <div className="rounded-[20px] border border-border bg-white dark:bg-surface overflow-hidden flex flex-col">
    {/* Header */}
    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
      <Skeleton className="h-4 w-36 rounded-lg" />
      <Skeleton className="h-3.5 w-16 rounded-md" />
    </div>

    {/* Method rows */}
    {[1, 2].map((i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border">
        {/* Card thumbnail */}
        <Skeleton className="h-[52px] w-[80px] rounded-[8px] shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32 rounded-lg" />
            {i === 1 && <Skeleton className="h-4 w-16 rounded-md" />}
          </div>
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
        <div className="flex gap-1 shrink-0">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    ))}

    {/* Add button */}
    <div className="p-4 border-t border-border">
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  </div>
);

// ─── PaymentHistory skeleton ──────────────────────────────────────────────────

export const PaymentHistorySkeleton: FC = () => (
  <div className="rounded-[20px] border border-border bg-white dark:bg-surface overflow-hidden">
    {/* Header */}
    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
      <Skeleton className="h-4 w-44 rounded-lg" />
      <Skeleton className="h-3.5 w-16 rounded-md" />
    </div>

    {/* Search + filters */}
    <div className="px-5 py-3 border-b border-border space-y-3">
      <Skeleton className="h-9 w-full rounded-xl" />
      <div className="flex items-center gap-2">
        {[56, 72, 80, 72].map((w, i) => (
          <Skeleton key={i} className={`h-7 rounded-full`} style={{ width: w }} />
        ))}
      </div>
    </div>

    {/* Column headers — desktop */}
    <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 border-b border-border bg-gray-50/50 dark:bg-white/[0.02]">
      <Skeleton className="flex-1 h-3 rounded-md opacity-50" />
      <Skeleton className="w-28 h-3 rounded-md opacity-50" />
      <Skeleton className="w-20 h-3 rounded-md opacity-50" />
      <Skeleton className="w-20 h-3 rounded-md opacity-50" />
      <div className="w-8 shrink-0" />
    </div>

    {/* Invoice rows */}
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-b-0 animate-pulse"
      >
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-3.5 w-28 rounded-lg" />
          <Skeleton className="sm:hidden h-3 w-36 rounded-md" />
        </div>
        <Skeleton className="hidden sm:block h-3.5 w-20 rounded-lg" />
        <Skeleton className="hidden sm:block h-3.5 w-14 rounded-lg" />
        <Skeleton className="hidden sm:block h-5 w-14 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      </div>
    ))}
  </div>
);

// ─── SupportCard skeleton ─────────────────────────────────────────────────────

export const SupportCardSkeleton: FC = () => (
  <div className="rounded-[20px] border border-border bg-gray-50/80 dark:bg-white/[0.02] p-5 sm:p-6">
    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
      <Skeleton className="h-12 w-12 rounded-[14px] shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48 rounded-lg" />
        <Skeleton className="h-3.5 w-72 rounded-md" />
        <Skeleton className="h-3.5 w-56 rounded-md" />
      </div>
      <Skeleton className="h-10 w-36 rounded-xl shrink-0" />
    </div>
  </div>
);

// ─── Pricing page skeleton ────────────────────────────────────────────────────

export const PricingPageSkeleton: FC = () => (
  <div className="pb-10 animate-in fade-in duration-300 space-y-14">
    {/* Header */}
    <div className="flex flex-col items-center text-center space-y-3 pt-2">
      <Skeleton className="h-3 w-14 rounded-full" />
      <Skeleton className="h-8 w-72 sm:w-96 rounded-xl" />
      <Skeleton className="h-4 w-64 rounded-lg" />
      {/* Toggle context */}
      <Skeleton className="h-3.5 w-36 rounded-full mt-2" />
      <Skeleton className="h-11 w-56 rounded-[16px]" />
      <Skeleton className="h-3.5 w-48 rounded-full" />
    </div>

    {/* Plan cards */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-[1100px] mx-auto">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-[20px] border border-border bg-white dark:bg-surface overflow-hidden">
          {i === 2 && <div className="h-[3px] bg-surface-hover" />}
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-24 rounded-lg" />
                <Skeleton className="h-3.5 w-40 rounded-md" />
              </div>
              {i === 2 && <Skeleton className="h-6 w-16 rounded-full" />}
            </div>
            <div className="space-y-1">
              <Skeleton className="h-10 w-28 rounded-lg" />
              <Skeleton className="h-3 w-36 rounded-md" />
            </div>
            <div className="space-y-2.5">
              {Array.from({ length: i === 2 ? 6 : 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2.5">
                  <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                  <Skeleton className="h-3.5 flex-1 rounded-md" />
                </div>
              ))}
            </div>
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>

    {/* Add-ons */}
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-60 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(i => <Skeleton key={i} className="h-[76px] rounded-[20px]" />)}
      </div>
    </div>

    {/* Enterprise CTA */}
    <Skeleton className="h-36 rounded-[20px] max-w-[1100px] mx-auto" />
  </div>
);

// ─── Checkout page skeleton (full-screen, no nav) ─────────────────────────────

export const CheckoutPageSkeleton: FC = () => (
  <div className="min-h-screen flex flex-col lg:flex-row animate-in fade-in duration-300">
    {/* Left sidebar — gradient placeholder */}
    <div
      className="hidden lg:flex w-[38%] h-screen flex-col p-12 gap-6"
      style={{ background: "linear-gradient(160deg, #004080 0%, #002D5A 100%)" }}
    >
      <Skeleton className="h-7 w-24 rounded-lg bg-white/10" />
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-16 rounded-full bg-white/[0.08]" />
        <Skeleton className="h-10 w-44 rounded-xl bg-white/10" />
        <Skeleton className="h-3 w-28 rounded-full bg-white/[0.08]" />
      </div>
      <div className="rounded-[20px] bg-white/[0.06] border border-white/[0.08] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded-lg bg-white/10" />
          <Skeleton className="h-4 w-16 rounded-lg bg-white/10" />
        </div>
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <Skeleton className="h-3.5 w-16 rounded-md bg-white/[0.08]" />
          <Skeleton className="h-6 w-24 rounded-lg bg-white/10" />
        </div>
      </div>
      <div className="space-y-4 mt-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full bg-white/10 shrink-0" />
            <Skeleton className="h-3.5 flex-1 rounded-md bg-white/[0.08]" />
          </div>
        ))}
      </div>
    </div>

    {/* Right main */}
    <div className="flex-1 px-5 py-8 sm:px-10 md:px-16 lg:px-20 lg:py-16">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-52 rounded-lg" />
        </div>

        {/* Plan preview card */}
        <div className="rounded-[20px] border border-border bg-white dark:bg-surface overflow-hidden">
          <div className="h-[3px] bg-surface-hover" />
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-6 w-32 rounded-lg" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-7 w-20 rounded-lg" />
                <Skeleton className="h-3 w-24 rounded-md" />
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-2.5">
                  <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                  <Skeleton className="h-3.5 flex-1 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-36 rounded-full" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-3 w-56 rounded-md" />
        </div>

        {/* CTA */}
        <Skeleton className="h-[52px] w-full rounded-xl" />

        {/* Trust row */}
        <div className="flex items-center justify-center gap-4">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-3 w-36 rounded-full" />
          <Skeleton className="h-3 w-28 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

// ─── Full billing layout skeleton ─────────────────────────────────────────────

export const BillingLayoutSkeleton: FC = () => (
  <div className="space-y-6 pb-10 animate-in fade-in duration-300">
    {/* Page header */}
    <div className="space-y-2">
      <Skeleton className="h-3 w-14 rounded-full" />
      <Skeleton className="h-7 w-52 rounded-xl" />
      <Skeleton className="h-4 w-72 rounded-lg" />
    </div>

    {/* Plans + Payment Methods */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PlanCardSkeleton />
      <PaymentMethodCardSkeleton />
    </div>

    {/* Invoice history */}
    <PaymentHistorySkeleton />

    {/* Support CTA */}
    <SupportCardSkeleton />
  </div>
);
