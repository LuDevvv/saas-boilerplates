import { CheckCircle2, ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";
import { FC, useState } from "react";

import { cn } from "@/utils/classNames";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  completed: boolean;
  onClick?: () => void;
  actionLabel?: string;
}

export interface ConfigStepsProps {
  steps: OnboardingStep[];
  title?: string;
  defaultCollapsed?: boolean;
  onDismiss?: () => void;
  className?: string;
}

// ─── Step row (compact horizontal) ───────────────────────────────────────────

const StepRow: FC<{ step: OnboardingStep; isActive: boolean }> = ({ step, isActive }) => (
  <div
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-[14px] border transition-all duration-200",
      step.completed
        ? "border-emerald-500/20 bg-emerald-500/[0.06]"
        : isActive
          ? "border-primary/25 bg-primary/[0.06]"
          : "border-border bg-surface-muted"
    )}
  >
    {/* Icon */}
    <div
      className={cn(
        "h-8 w-8 rounded-[10px] flex items-center justify-center shrink-0",
        step.completed
          ? "bg-emerald-500/15"
          : isActive
            ? "bg-primary/15"
            : "bg-surface-hover"
      )}
    >
      {step.completed ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <step.icon
          className={cn(
            "h-4 w-4",
            isActive ? "text-primary" : "text-fg-muted"
          )}
        />
      )}
    </div>

    {/* Text */}
    <div className="flex-1 min-w-0">
      <p
        className={cn(
          "text-[13px] font-semibold leading-snug",
          step.completed ? "text-fg-muted" : "text-fg"
        )}
      >
        {step.title}
      </p>
      <p className="text-[11px] text-fg-muted mt-0.5 truncate leading-snug">
        {step.description}
      </p>
    </div>

    {/* Action */}
    {step.completed ? (
      <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Listo</span>
      </span>
    ) : step.onClick ? (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); step.onClick?.(); }}
        className={cn(
          "shrink-0 flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all duration-150 active:scale-95",
          isActive
            ? "bg-primary/15 text-primary hover:bg-primary/20"
            : "bg-surface-hover text-fg-secondary hover:bg-surface-elevated hover:text-fg"
        )}
      >
        {step.actionLabel ?? "Ir"}
        <ChevronRight className="h-3 w-3" />
      </button>
    ) : (
      <span className="shrink-0 text-[10px] text-fg-disabled font-medium">Pendiente</span>
    )}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const ConfigSteps: FC<ConfigStepsProps> = ({
  steps,
  title = "Completa tu configuración",
  defaultCollapsed = false,
  onDismiss,
  className,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const completedCount = steps.filter(s => s.completed).length;
  const total = steps.length;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  if (completedCount === total) return null;

  return (
    <div
      className={cn(
        "rounded-[20px] border border-border bg-surface overflow-hidden",
        className
      )}
    >
      {/* ── Header ── */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-hover transition-colors duration-150"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Circular progress */}
          <div className="relative shrink-0 h-9 w-9">
            <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="15"
                fill="none"
                className="stroke-gray-100 dark:stroke-white/8"
                strokeWidth="2.5"
              />
              <circle
                cx="18" cy="18" r="15"
                fill="none"
                className="stroke-primary"
                strokeWidth="2.5"
                strokeDasharray={`${(2 * Math.PI * 15).toFixed(1)}`}
                strokeDashoffset={`${((1 - progress / 100) * 2 * Math.PI * 15).toFixed(1)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-primary tabular-nums">
              {progress}%
            </span>
          </div>

          <div className="min-w-0 text-left">
            <p className="text-[13px] sm:text-[14px] font-semibold text-fg leading-snug">
              {title}
            </p>
            <p className="text-[11px] text-fg-muted mt-0.5">
              {completedCount} de {total} completados
            </p>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 shrink-0 transition-transform duration-300",
            !collapsed && "rotate-180"
          )}
        />
      </button>

      {/* ── Steps — collapsible list ── */}
      <div
        className={cn(
          "grid transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0.5 border-t border-border">
            <div className="pt-3 space-y-2">
              {steps.map((step, i) => {
                const isActive =
                  !step.completed && (i === 0 || steps[i - 1]?.completed);
                return <StepRow key={step.id} step={step} isActive={isActive} />;
              })}
            </div>

            {onDismiss && (
              <div className="pt-3">
                <button
                  onClick={onDismiss}
                  className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  No mostrar de nuevo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
