import { Rocket, Zap, Wrench, ArrowRight, type LucideIcon } from "lucide-react";
import { FC, useState } from "react";

import { cn } from "@/utils/classNames";

export interface ReleaseNote {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  type: "feature" | "fix" | "improvement";
}

// ─── Config ───────────────────────────────────────────────────────────────────

interface TypeConfig {
  icon: LucideIcon;
  label: string;
  featuredBg: string;
  compactBg: string;
  badgeFeatured: string;
  badgeCompact: string;
  iconColor: string;
}

const TYPE_CONFIG: Record<string, TypeConfig> = {
  feature: {
    icon: Rocket,
    label: "Nuevo",
    featuredBg: "bg-gradient-to-br from-primary to-primary-600 dark:from-primary/80 dark:to-primary-600/80",
    compactBg: "bg-primary/[0.04] dark:bg-primary/[0.08]",
    badgeFeatured: "bg-white/15 text-white border border-white/20",
    badgeCompact: "bg-primary/10 text-primary",
    iconColor: "text-primary",
  },
  improvement: {
    icon: Zap,
    label: "Mejora",
    featuredBg: "bg-gradient-to-br from-amber-500 to-amber-700",
    compactBg: "bg-amber-50 dark:bg-amber-500/[0.06]",
    badgeFeatured: "bg-white/15 text-white border border-white/20",
    badgeCompact: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
    iconColor: "text-amber-500 dark:text-amber-400",
  },
  fix: {
    icon: Wrench,
    label: "Fix",
    featuredBg: "bg-gradient-to-br from-gray-500 to-gray-700",
    compactBg: "bg-gray-50 dark:bg-white/[0.03]",
    badgeFeatured: "bg-white/15 text-white border border-white/20",
    badgeCompact: "bg-surface-hover text-fg-secondary",
    iconColor: "text-fg-secondary",
  },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

const DEFAULT_VISIBLE = 4;

// ─── Featured card (first note) ───────────────────────────────────────────────

const FeaturedCard: FC<{ note: ReleaseNote }> = ({ note }) => {
  const cfg = TYPE_CONFIG[note.type] ?? TYPE_CONFIG.feature;
  const Icon = cfg.icon;

  return (
    <div className={cn("relative rounded-[20px] overflow-hidden", cfg.featuredBg)}>
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-white/[0.04] pointer-events-none" />
      <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/[0.03] pointer-events-none" />
      {/* Large decorative icon */}
      <Icon className="absolute bottom-3 right-4 h-24 w-24 text-white opacity-[0.07] rotate-12 pointer-events-none" />

      <div className="relative z-10 p-5">
        {/* Badge row */}
        <div className="flex items-center justify-between mb-3">
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ", cfg.badgeFeatured)}>
            <Icon className="h-3 w-3" />
            {cfg.label}
          </span>
          <div className="flex items-center gap-2">
            {note.version && (
              <code className="text-[10px] font-mono text-white/40">v{note.version}</code>
            )}
            <span className="text-[10px] text-white/35 font-medium">{formatDate(note.date)}</span>
          </div>
        </div>

        {/* Title + description */}
        <h3 className="text-[15px] sm:text-[16px] font-bold text-white leading-snug mb-2">
          {note.title}
        </h3>
        <p className="text-[12px] text-white/60 leading-relaxed line-clamp-2">
          {note.description}
        </p>
      </div>
    </div>
  );
};

// ─── Compact card (remaining notes) ──────────────────────────────────────────

const CompactCard: FC<{ note: ReleaseNote }> = ({ note }) => {
  const cfg = TYPE_CONFIG[note.type] ?? TYPE_CONFIG.feature;
  const Icon = cfg.icon;

  return (
    <div className={cn(
      "flex items-start gap-3 rounded-[16px] border border-border px-4 py-3.5",
      "bg-white dark:bg-canvas",
      "hover:border-border-strong transition-colors duration-150"
    )}>
      {/* Icon */}
      <div className={cn("h-8 w-8 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5", cfg.compactBg)}>
        <Icon className={cn("h-3.5 w-3.5", cfg.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={cn("text-[9px] font-bold uppercase  px-1.5 py-0.5 rounded-md", cfg.badgeCompact)}>
            {cfg.label}
          </span>
          {note.version && (
            <code className="text-[9px] text-gray-300 dark:text-gray-600 font-mono">v{note.version}</code>
          )}
          <span className="ml-auto text-[10px] text-gray-300 dark:text-gray-600 shrink-0">
            {formatDate(note.date)}
          </span>
        </div>
        <p className="text-[12px] font-semibold text-fg leading-snug">
          {note.title}
        </p>
        <p className="text-[11px] text-fg-muted mt-0.5 line-clamp-1 leading-relaxed">
          {note.description}
        </p>
      </div>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: FC = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center px-6 rounded-[20px] border border-border bg-white dark:bg-canvas">
    <div className="h-11 w-11 rounded-full bg-surface-hover flex items-center justify-center mb-3">
      <Rocket className="h-5 w-5 text-gray-300 dark:text-gray-600" />
    </div>
    <p className="text-[13px] font-semibold text-fg-secondary">Sin novedades por ahora</p>
    <p className="text-[12px] text-gray-400 mt-1">Las actualizaciones aparecerán aquí pronto.</p>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const NovedadesSection: FC<{ notes: ReleaseNote[] }> = ({ notes }) => {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? notes : notes.slice(0, DEFAULT_VISIBLE);
  const hasMore = notes.length > DEFAULT_VISIBLE;
  const [featured, ...rest] = visible;

  if (notes.length === 0) {
    return (
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase text-fg-muted">Novedades</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>
        <EmptyState />
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[11px] font-bold uppercase text-fg-muted whitespace-nowrap">
            Novedades
          </span>
          <div className="h-px flex-1 bg-[var(--border)] min-w-[20px]" />
        </div>
        {(hasMore || showAll) && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="shrink-0 flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary-600 transition-colors"
          >
            {showAll ? "Ver menos" : "Ver historial"}
            {!showAll && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Featured card */}
      {featured && <FeaturedCard note={featured} />}

      {/* Compact remaining */}
      {rest.length > 0 && (
        <div className="space-y-2">
          {rest.map(note => (
            <CompactCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </section>
  );
};
