"use client";

import { useGsapReveal } from "@node-stack/ui";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

// ─── Stat item ────────────────────────────────────────────────

interface StatDef {
  display: React.ReactNode;
  label: string;
}

function StatBlock({ stat, isLast }: { stat: StatDef; isLast: boolean }) {
  return (
    <>
      <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="text-5xl font-bold gradient-text leading-none mb-3">
          {stat.display}
        </div>
        <p className="text-sm text-neutral-400 mt-1 max-w-[10rem] leading-snug">
          {stat.label}
        </p>
      </div>

      {/* Divider — hidden on mobile, shown between non-last items on md+ */}
      {!isLast && (
        <div
          aria-hidden="true"
          className="hidden md:block self-stretch w-px bg-white/10 my-8"
        />
      )}
    </>
  );
}

const STATS: StatDef[] = [
  {
    display: (
      <AnimatedCounter value={10000} suffix="+" className="tabular-nums" />
    ),
    label: "Developers using the boilerplate",
  },
  {
    // Decimal — render statically
    display: <span className="tabular-nums">99.9%</span>,
    label: "Production uptime across deployments",
  },
  {
    // Non-numeric — render statically
    display: <span className="tabular-nums">&lt;&nbsp;5min</span>,
    label: "Time to your first production deploy",
  },
  {
    display: (
      <AnimatedCounter value={2} suffix="×" className="tabular-nums" />
    ),
    label: "Faster than building from scratch",
  },
];

// ─── Section ──────────────────────────────────────────────────

export function StatsSection() {
  const ref = useGsapReveal<HTMLElement>({ direction: "up", delay: 0, duration: 0.7 });

  return (
    <section
      ref={ref}
      aria-label="Key metrics"
      className="section bg-neutral-900"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-neutral-500">
          By the numbers
        </p>

        {/* Stats grid */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center divide-y divide-white/10 sm:divide-y-0 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          {STATS.map((stat, i) => (
            <div key={i} className="flex-1 flex items-center justify-center relative">
              <StatBlock stat={stat} isLast={i === STATS.length - 1} />
              {/* Vertical divider between items on sm+ */}
              {i < STATS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="hidden sm:block absolute right-0 top-8 bottom-8 w-px bg-white/10"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
