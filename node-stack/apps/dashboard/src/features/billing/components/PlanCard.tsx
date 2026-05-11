import { Button } from "@node-stack/ui";
import { CheckCircle2, Calendar, ChevronRight, Hourglass, AlertCircle, PauseCircle, XCircle } from "lucide-react";
import { FC, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { cn } from "@/utils/classNames";

const PLAN_CATALOG = [
  {
    id: "pro",
    name: "Growth",
    subtitle: "Para equipos en crecimiento",
    price: 29,
    features: ["Proyectos ilimitados", "Soporte prioritario", "Analíticas avanzadas"],
  },
  {
    id: "elite",
    name: "Unlimited",
    subtitle: "Para organizaciones sin límites",
    price: 99,
    features: ["Todo Growth", "SLA 99.99%", "Soporte dedicado"],
  },
] as const;

interface PlanCardProps {
  isPremium: boolean;
  planId?: string;
  planName: string;
  price: string;
  interval?: "monthly" | "yearly";
  status?: string;
  trialEndsAt?: string;
  cancelAt?: string;
  daysRemaining?: number;
  nextBillingDate?: string;
  onUpgrade: () => void;
  onCancel: () => void;
  className?: string;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

interface BadgeConfig {
  label: string;
  className: string;
  icon: FC<{ className?: string }>;
}

function getStatusBadge(
  status: string,
  cancelAt: string | undefined,
  trialDaysLeft: number,
): BadgeConfig {
  if (cancelAt && (status === "active" || status === "trialing" || status === "trialling")) {
    return {
      label: "Cancelación programada",
      className: "text-primary border border-primary/30 bg-primary/[0.07] dark:bg-primary/[0.12]",
      icon: ({ className }) => <Hourglass className={className} />,
    };
  }

  switch (status) {
    case "active":
      return {
        label: "Activo",
        className: "text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25",
        icon: ({ className }) => <div className={cn("rounded-full bg-emerald-500", className)} />,
      };
    case "trialing":
    case "trialling":
      return {
        label: `Prueba · ${trialDaysLeft}d restantes`,
        className: "text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10",
        icon: ({ className }) => <Hourglass className={className} />,
      };
    case "past_due":
      return {
        label: "Pago atrasado",
        className: "text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/25 bg-red-50 dark:bg-red-500/10",
        icon: ({ className }) => <AlertCircle className={className} />,
      };
    case "cancelled":
    case "canceled":
      return {
        label: "Cancelado",
        className: "text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/25 bg-red-50 dark:bg-red-500/10",
        icon: ({ className }) => <XCircle className={className} />,
      };
    case "paused":
      return {
        label: "Pausada",
        className: "text-gray-500 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-500/10",
        icon: ({ className }) => <PauseCircle className={className} />,
      };
    case "unpaid":
      return {
        label: "Sin pago",
        className: "text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/25 bg-red-50 dark:bg-red-500/10",
        icon: ({ className }) => <AlertCircle className={className} />,
      };
    default:
      return {
        label: "Activo",
        className: "text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25",
        icon: ({ className }) => <div className={cn("rounded-full bg-emerald-500", className)} />,
      };
  }
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
  cancelAt,
  daysRemaining,
  nextBillingDate,
  onUpgrade,
  onCancel,
}) => {
  const navigate = useNavigate();

  const isTrialing = status === "trialing" || status === "trialling";
  const isCancelling = !!cancelAt && (status === "active" || isTrialing);
  const isCancelled = status === "cancelled" || status === "canceled";
  const isPastDue = status === "past_due";

  const trialDaysLeft = useMemo(() => {
    if (!trialEndsAt) return 0;
    return Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000));
  }, [trialEndsAt]);

  const cancelProgress = useMemo(() => {
    if (!cancelAt || !daysRemaining) return 0;
    const total = 30; // assume ~30 day billing period as fallback
    return Math.max(0, Math.min(100, (daysRemaining / total) * 100));
  }, [cancelAt, daysRemaining]);

  const badge = getStatusBadge(status, cancelAt, trialDaysLeft);

  const currentId = planId || (isPremium ? "pro" : "pro");
  const currentPlan = PLAN_CATALOG.find(p => p.id === currentId) ?? PLAN_CATALOG[0];
  const otherPlans = PLAN_CATALOG.filter(p => p.id !== currentId);


  return (
    <div className="rounded-[20px] border border-border bg-white dark:bg-surface overflow-hidden flex flex-col">

      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-fg">Planes disponibles</h3>
        <button
          onClick={onUpgrade}
          className="text-[12px] font-medium text-primary hover:text-primary-600 transition-colors flex items-center gap-1"
        >
          Ver todos <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Current plan */}
      <div className="px-5 py-5 border-b border-border">

        {/* Tag + badge row */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 dark:bg-primary/20 text-primary text-[10px] font-bold uppercase">
            Plan actual
          </span>

          <div className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold",
            badge.className
          )}>
            {badge.label.includes("Activo") ? (
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            ) : (
              <badge.icon className="h-2.5 w-2.5" />
            )}
            {badge.label}
          </div>
        </div>

        {/* Plan name */}
        <h4 className="text-[18px] font-bold text-fg leading-snug">
          {planName}
        </h4>
        <p className="text-[12px] text-fg-muted mt-0.5">{currentPlan.subtitle}</p>

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
          {price !== "$0" && price !== "$0.00" && (
            <span className="text-[11px] text-fg-muted ml-0.5">
              /{interval === "yearly" ? "año" : "mes"}
            </span>
          )}
        </div>

        {/* Trial progress bar */}
        {isTrialing && !isCancelling && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-fg-muted mb-1">
              <span>Período de prueba</span>
              <span>{trialDaysLeft}d restantes</span>
            </div>
            <div className="relative h-1.5 w-full rounded-full bg-primary/10 overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${(trialDaysLeft / 14) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Cancel progress bar — shows date + days in one row, no need for a separate calendar line */}
        {isCancelling && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-fg-muted mb-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                Acceso hasta: {nextBillingDate}
              </span>
              <span>{daysRemaining ?? 0}d</span>
            </div>
            <div className="relative h-1.5 w-full rounded-full bg-primary/10 overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${cancelProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Next billing / trial date — only when NOT cancelling (cancel row already shows date) */}
        {isPremium && nextBillingDate && !isCancelling && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-fg-muted">
            <Calendar className="h-3 w-3 shrink-0" />
            {isTrialing
              ? `Prueba hasta: ${nextBillingDate}`
              : `Próximo cargo: ${nextBillingDate}`}
          </div>
        )}

        {/* Past due warning */}
        {isPastDue && (
          <p className="mt-2 text-[11px] text-red-600 dark:text-red-400">
            Actualiza tu método de pago para mantener el acceso.
          </p>
        )}
      </div>

      {/* Other plans — compact rows */}
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
              <p className="text-[14px] font-semibold text-fg">{plan.name}</p>
              <p className="text-[12px] text-fg-muted mt-0.5">{plan.subtitle}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[16px] font-semibold text-fg tabular-nums">${plan.price}</span>
                <span className="text-[11px] text-fg-muted">/mes</span>
              </div>
              <Button
                onClick={() => navigate(`/payments/pricing`)}
                variant="primary"
                size="sm"
                className="h-8 px-4 rounded-[10px] text-[11px] font-medium"
              >
                {(plan.price > (currentPlan.price ?? 0)) ? "Mejorar" : "Cambiar"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Cancel / reactivate footer */}
      {isPremium && !isCancelled && (
        <div className="px-5 py-3.5 border-t border-border flex items-center justify-between">
          {isCancelling ? (
            <>
              <p className="text-[11px] text-fg-muted">Cancela el plan al final del ciclo.</p>
              <button
                onClick={() => navigate("/payments/pricing")}
                className="text-[12px] font-medium text-primary hover:text-primary-600 transition-colors"
              >
                Ver opciones
              </button>
            </>
          ) : (
            <>
              <p className="text-[11px] text-fg-muted">¿Quieres cancelar tu suscripción?</p>
              <button
                onClick={onCancel}
                className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                Cancelar plan
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
