import { Button } from "@node-stack/ui";
import { CheckCircle2, Calendar, ChevronRight, Hourglass } from "lucide-react";
import { FC } from "react";

import { cn } from "@/utils/classNames";

// ─── Plan catalog ─────────────────────────────────────────────────────────────

const PLAN_CATALOG = [
  {
    id: "free",
    name: "Starter",
    subtitle: "Para individuos y proyectos pequeños",
    price: 0,
    features: ["Hasta 5 usuarios", "Soporte básico"],
  },
  {
    id: "pro",
    name: "Growth",
    subtitle: "Para equipos en crecimiento",
    price: 29,
    features: ["Hasta 25 usuarios", "Soporte prioritario", "Analíticas avanzadas"],
  },
  {
    id: "elite",
    name: "Unlimited",
    subtitle: "Para organizaciones sin límites",
    price: 99,
    features: ["Usuarios ilimitados", "SLA garantizado", "Soporte dedicado"],
  },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlanCardProps {
  isPremium: boolean;
  planId?: string;
  planName: string;
  price: string;
  interval?: "monthly" | "yearly";
  status?: string;          // 'active' | 'trialing' | 'past_due' | 'canceled'
  trialEndsAt?: string;     // ISO date string when trial ends
  daysRemaining?: number;
  nextBillingDate?: string;
  onUpgrade: () => void;
  onCancel: () => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PlanCard: FC<PlanCardProps> = ({
  isPremium,
  planId,
  planName,
  price,
  interval = "monthly",
  status = "active",
  trialEndsAt,
  daysRemaining,
  nextBillingDate,
  onUpgrade,
  onCancel,
}) => {
  const isTrialing = status === "trialing";
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : 0;

  const currentId = planId || (isPremium ? "pro" : "free");
  const currentPlan = PLAN_CATALOG.find(p => p.id === currentId) ?? PLAN_CATALOG[0];
  const otherPlans = PLAN_CATALOG.filter(p => p.id !== currentId);

  return (
    <div className="rounded-[20px] border border-border bg-white dark:bg-surface overflow-hidden flex flex-col">

      {/* ── Section header ── */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-fg">
          Planes disponibles
        </h3>
        <button
          onClick={onUpgrade}
          className="text-[12px] font-medium text-primary hover:text-primary-600 transition-colors flex items-center gap-1"
        >
          Ver todos <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Current plan — left-aligned ── */}
      <div className="px-5 py-5 border-b border-border">
        {/* Tag row */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 dark:bg-primary/20 text-primary text-[10px] font-bold uppercase">
            Plan actual
          </span>
          {isTrialing ? (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10">
              <Hourglass className="h-2.5 w-2.5" />
              Prueba · {trialDaysLeft}d restantes
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Activo
            </div>
          )}
        </div>

        {/* Plan name + subtitle */}
        <h4 className="text-[18px] font-bold text-fg leading-snug">
          {planName}
        </h4>
        <p className="text-[12px] text-fg-muted mt-0.5">
          {currentPlan.subtitle}
        </p>

        {/* Features */}
        <div className="mt-3 space-y-1.5">
          {currentPlan.features.slice(0, 2).map(f => (
            <div key={f} className="flex items-center gap-1.5 text-[12px] text-fg-secondary">
              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
              {f}
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mt-4">
          <span className="text-[22px] font-bold text-fg tabular-nums leading-none">
            {price}
          </span>
          {price !== "$0.00" && (
            <span className="text-[11px] text-fg-muted ml-0.5">
              /{interval === "yearly" ? "año" : "mes"}
            </span>
          )}
        </div>

        {/* Billing / trial info */}
        {isPremium && nextBillingDate && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-fg-muted">
            <Calendar className="h-3 w-3 shrink-0" />
            {isTrialing
              ? `Prueba gratuita hasta: ${nextBillingDate}`
              : `Próximo cargo: ${nextBillingDate}`}
            {(daysRemaining ?? 0) > 0 && (
              <span className="ml-1 text-[10px] bg-surface-hover px-1.5 py-0.5 rounded-md">
                {daysRemaining}d
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Other plans — compact rows ── */}
      <div className="flex-1">
        {otherPlans.map((plan, idx) => (
          <div
            key={plan.id}
            className={cn(
              "flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-hover transition-colors duration-150",
              idx < otherPlans.length - 1 && "border-b border-border"
            )}
          >
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-fg">
                {plan.name}
              </p>
              <p className="text-[12px] text-fg-muted mt-0.5">
                {plan.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[16px] font-semibold text-fg tabular-nums">
                  ${plan.price}
                </span>
                <span className="text-[11px] text-fg-muted">/mes</span>
              </div>
              <Button
                onClick={onUpgrade}
                variant="primary"
                size="sm"
                className="h-8 px-4 rounded-[10px] text-[11px] font-medium"
              >
                Mejorar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Cancel option ── */}
      {isPremium && (
        <div className="px-5 py-3.5 border-t border-border flex items-center justify-between">
          <p className="text-[11px] text-fg-muted">¿Quieres cancelar tu suscripción?</p>
          <button
            onClick={onCancel}
            className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors"
          >
            Cancelar plan
          </button>
        </div>
      )}
    </div>
  );
};
