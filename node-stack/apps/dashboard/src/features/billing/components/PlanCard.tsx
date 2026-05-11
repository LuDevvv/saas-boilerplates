import { Button } from "@node-stack/ui";
import { CheckCircle2, Calendar, ChevronRight, AlertCircle, PauseCircle, XCircle, Loader2 } from "lucide-react";
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
  onReactivate?: () => void;
  isReactivating?: boolean;
  className?: string;
}

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
  onReactivate,
  isReactivating = false,
}) => {
  const navigate = useNavigate();

  const isTrialing  = status === "trialing" || status === "trialling";
  const isCancelling = !!cancelAt && (status === "active" || isTrialing);
  const isCancelled  = status === "cancelled" || status === "canceled";
  const isPastDue    = status === "past_due";
  const isUnpaid     = status === "unpaid";
  const isPaused     = status === "paused";

  const trialDaysLeft = useMemo(() => {
    if (!trialEndsAt) return 0;
    return Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000));
  }, [trialEndsAt]);

  const cancelProgress = useMemo(() => {
    if (!cancelAt || !daysRemaining) return 0;
    return Math.max(0, Math.min(100, (daysRemaining / 30) * 100));
  }, [cancelAt, daysRemaining]);

  const currentId   = planId || "pro";
  const currentPlan = PLAN_CATALOG.find(p => p.id === currentId) ?? PLAN_CATALOG[0];
  const otherPlans  = PLAN_CATALOG.filter(p => p.id !== currentId);

  // ── Alert strip (only for actionable error states) ──────────────────────────
  const alertStrip = (() => {
    if (isPastDue) return { text: "Hay un problema con tu pago. Actualiza tu método de pago para mantener el acceso.", color: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-b border-red-100 dark:border-red-500/20", icon: AlertCircle };
    if (isUnpaid)  return { text: "Sin pago: actualiza tu método de pago para restaurar el acceso.", color: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-b border-red-100 dark:border-red-500/20", icon: AlertCircle };
    if (isPaused)  return { text: "Suscripción pausada.", color: "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600/30", icon: PauseCircle };
    if (isCancelled) return { text: "Tu suscripción ha finalizado. Elige un plan para recuperar el acceso.", color: "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600/30", icon: XCircle };
    return null;
  })();

  return (
    <div className="rounded-[20px] border border-border bg-white dark:bg-surface overflow-hidden flex flex-col">

      {/* Alert strip — only for error/ended states */}
      {alertStrip && (
        <div className={cn("flex items-start gap-2 px-5 py-3 text-[12px]", alertStrip.color)}>
          <alertStrip.icon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <p>{alertStrip.text}</p>
        </div>
      )}

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

        {/* "Plan actual" tag only */}
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 dark:bg-primary/20 text-primary text-[10px] font-bold uppercase">
            Plan actual
          </span>
        </div>

        {/* Plan name */}
        <h4 className="text-[18px] font-bold text-fg leading-snug">{planName}</h4>
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
          <span className="text-[22px] font-bold text-fg tabular-nums leading-none">{price}</span>
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

        {/* Cancellation progress bar */}
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

        {/* Next billing date — only when active and not cancelling */}
        {isPremium && nextBillingDate && !isCancelling && !isTrialing && !isCancelled && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-fg-muted">
            <Calendar className="h-3 w-3 shrink-0" />
            Próximo cargo: {nextBillingDate}
          </div>
        )}

        {/* Trial billing date */}
        {isTrialing && nextBillingDate && !isCancelling && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-fg-muted">
            <Calendar className="h-3 w-3 shrink-0" />
            Prueba hasta: {nextBillingDate}
          </div>
        )}
      </div>

      {/* Other plans */}
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
                onClick={() => navigate("/payments/pricing")}
                variant="primary"
                size="sm"
                className="h-8 px-4 rounded-[10px] text-[11px] font-medium"
              >
                {plan.price > (currentPlan.price ?? 0) ? "Mejorar" : "Cambiar"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer — cancel or reactivate */}
      {isPremium && !isCancelled && (
        <div className="px-5 py-3.5 border-t border-border flex items-center justify-between">
          {isCancelling ? (
            <>
              <p className="text-[11px] text-fg-muted">¿Cambias de opinión?</p>
              <button
                onClick={onReactivate}
                disabled={isReactivating}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:text-primary-600 transition-colors disabled:opacity-60"
              >
                {isReactivating && <Loader2 className="h-3 w-3 animate-spin" />}
                Reactivar suscripción
              </button>
            </>
          ) : (
            <>
              <p className="text-[11px] text-fg-muted">¿Quieres cancelar?</p>
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
