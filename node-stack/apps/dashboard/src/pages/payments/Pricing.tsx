import { BillingToggle } from "@node-stack/ui";
import {
  Check,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";

import { BackButton } from "@/components/shared/BackButton";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useSubscription, useChangePlan } from "@/features/billing/hooks/useBilling";
import { appToast } from "@/components/alerts/Toasts";
import { cn } from "@/utils/classNames";

// ─── Plan catalog ─────────────────────────────────────────────────────────────

// trialDays: set to the number of trial days configured on the product in Polar.
// Set to 0 to hide the trial badge. Must match what's configured in Polar dashboard.
const PLANS = [
  {
    id: "pro",
    name: "Growth",
    description: "Para negocios que necesitan escalar con potencia.",
    price: 29,
    yearlyPrice: 290,
    trialDays: 0,   // e.g. set to 7 if you configure a 7-day trial in Polar
    features: [
      "Proyectos ilimitados",
      "Analíticas avanzadas",
      "Soporte prioritario 24/7",
      "10 GB de almacenamiento",
      "Exportación de datos",
      "Acceso API",
    ],
    popular: true,
  },
  {
    id: "elite",
    name: "Unlimited",
    description: "Infraestructura dedicada para organizaciones.",
    price: 99,
    yearlyPrice: 990,
    trialDays: 0,
    features: [
      "Todo lo de Growth",
      "Infraestructura dedicada",
      "SLA del 99.99%",
      "Almacenamiento ilimitado",
      "Manager dedicado",
      "Integraciones personalizadas",
    ],
    popular: false,
  },
] as const;

// ─── Pricing page ─────────────────────────────────────────────────────────────

interface PricingProps {
  isOnboarding?: boolean;
}

const Pricing: FC<PricingProps> = ({ isOnboarding = false }) => {
  const navigate        = useNavigate();
  const { toDOP }       = useExchangeRate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);

  const { data: subscription } = useSubscription();
  const changePlanMutation = useChangePlan();

  const hasActiveSub =
    !!subscription &&
    subscription.status !== "none" &&
    subscription.status !== "cancelled" &&
    subscription.status !== "canceled";

  const handleSelectPlan = async (planId: string, trialDays: number) => {
    if (planId === "free") return;
    const cycle = isAnnual ? "yearly" : "monthly";

    // If user already has an active subscription, upgrade/downgrade in-place
    if (hasActiveSub) {
      setChangingPlan(planId);
      try {
        await changePlanMutation.mutateAsync({ planId, variantId: cycle });
        appToast.success({
          title: "Plan actualizado",
          description: "Tu suscripción ha sido actualizada correctamente.",
        });
        navigate("/payments");
      } catch {
        appToast.error({ title: "Error", description: "No se pudo cambiar el plan." });
      } finally {
        setChangingPlan(null);
      }
      return;
    }

    const onboarding = isOnboarding ? "&onboarding=true" : "";
    const trial = trialDays > 0 ? `&trial=${trialDays}` : "";
    navigate(`/payments/checkout?plan=${planId}&billing=${cycle}${trial}${onboarding}`);
  };

  const growthSavings = PLANS[0].price * 12 - PLANS[0].yearlyPrice;

  return (
    <div className="pb-10 animate-in fade-in duration-500">
      {!isOnboarding && (
        <BackButton to="/payments" label="Volver a Pagos" className="mb-6" />
      )}

      {/* ── Header ── */}
      <div className="flex flex-col items-center text-center mb-12">
        <p className="text-[11px] font-bold uppercase text-primary/70 dark:text-primary/60 mb-3">
          Planes
        </p>
        <h1 className="text-2xl sm:text-3xl font-heading text-fg max-w-xl leading-tight">
          El plan perfecto para tu equipo
        </h1>
        <p className="text-[13px] text-fg-muted mt-2 max-w-md leading-relaxed">
          Optimiza tu flujo de trabajo con toda la potencia de la plataforma.
          Cancela en cualquier momento.
        </p>

        {/* Billing toggle */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-[12px] text-fg-muted font-medium">
            Ciclo de facturación
          </p>
          <BillingToggle
            isAnnualBilling={isAnnual}
            onChange={setIsAnnual}
            discountLabel=""
          />
          <div className={cn(
            "flex items-center gap-1.5 text-[12px] font-medium transition-all duration-300",
            isAnnual
              ? "text-emerald-600 dark:text-emerald-400 opacity-100"
              : "text-gray-300 dark:text-gray-600 opacity-60"
          )}>
            <TrendingDown className="h-3.5 w-3.5 shrink-0" />
            {isAnnual
              ? `Con el plan Growth ahorras US$ ${growthSavings} al año`
              : "Cambia a anual y ahorra hasta 15%"}
          </div>
        </div>
      </div>

      {/* ── Plan cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[800px] mx-auto mb-16">
        {PLANS.map((plan) => {
          const currentInterval = subscription?.interval ?? "monthly";
          const selectedInterval = isAnnual ? "yearly" : "monthly";
          const isCurrent =
            hasActiveSub &&
            currentInterval === selectedInterval &&
            (subscription?.planId === plan.id ||
              (plan.id === "pro" && subscription?.planId === "premium"));

          const displayPrice = isAnnual
            ? Math.round(plan.yearlyPrice / 12)
            : plan.price;

          const annualSavings =
            isAnnual && plan.price > 0
              ? plan.price * 12 - plan.yearlyPrice
              : 0;

          const dopEquiv = toDOP(displayPrice);

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-[20px] border overflow-hidden transition-all duration-300 bg-surface",
                plan.popular
                  ? "border-primary/40 ring-1 ring-primary/20 shadow-[0_8px_28px_-6px_rgba(0,64,128,0.12)] dark:shadow-[0_8px_28px_-6px_rgba(91,168,229,0.18)]"
                  : "border-border"
              )}
            >
              <div className="flex flex-col flex-1 p-6">
                {/* Plan name + badges */}
                <div className="flex items-start justify-between gap-2 mb-5">
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-bold text-fg leading-snug">
                      {plan.name}
                    </h3>
                    <p className="text-[12px] text-fg-muted mt-0.5 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {plan.popular && !isCurrent && (
                      <span className="text-[10px] font-bold uppercase text-primary-foreground px-2.5 py-1 rounded-full bg-primary">
                        Popular
                      </span>
                    )}
                    {plan.trialDays > 0 && !isCurrent && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        {plan.trialDays}d gratis
                      </span>
                    )}
                  </div>
                  {isCurrent && (
                    <div className="shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Activo
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[38px] font-semibold text-fg tabular-nums leading-none">
                      ${displayPrice}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-[13px] text-gray-400 ml-1">
                        /{isAnnual ? "año" : "mes"}
                      </span>
                    )}
                  </div>

                  {plan.price > 0 && dopEquiv && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      ≈ {dopEquiv}/mes
                    </p>
                  )}

                  <p className="text-[11px] text-gray-400 mt-1">
                    {isAnnual
                      ? `US$ ${plan.yearlyPrice}/año · Ahorras US$ ${annualSavings}`
                      : "Facturado mensualmente"}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                        plan.popular
                          ? "bg-primary/10 dark:bg-primary/20"
                          : "bg-surface-hover"
                      )}>
                        <Check
                          className={cn(
                            "h-3 w-3",
                            plan.popular ? "text-primary" : "text-fg-secondary"
                          )}
                          strokeWidth={2.5}
                        />
                      </div>
                      <span className="text-[13px] text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div className="h-11 rounded-xl flex items-center justify-center gap-2 text-[12px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Plan Actual
                  </div>
                ) : plan.trialDays > 0 && !hasActiveSub ? (
                  <button
                    onClick={() => handleSelectPlan(plan.id, plan.trialDays)}
                    disabled={!!changingPlan}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-medium transition-all active:scale-[0.98] shadow-[0_4px_14px_-2px_rgba(5,150,105,0.30)] disabled:opacity-60"
                  >
                    Probar gratis {plan.trialDays} días
                    <ArrowRight className="inline ml-1.5 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.id, plan.trialDays)}
                    disabled={!!changingPlan}
                    className="w-full h-11 rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground text-[13px] font-medium transition-colors shadow-[0_4px_14px_-2px_rgba(0,64,128,0.20)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.20)] disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  >
                    {changingPlan === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cambiando...
                      </>
                    ) : (
                      <>
                        {(() => {
                          if (!hasActiveSub) return `Suscribirse a ${plan.name}`;
                          // Compare current vs selected plan cost to determine upgrade/downgrade
                          const PRICES: Record<string, { monthly: number; yearly: number }> = {
                            pro: { monthly: 29, yearly: 290 },
                            elite: { monthly: 99, yearly: 990 },
                          };
                          const currentCost = PRICES[subscription?.planId ?? ""]?.[subscription?.interval ?? "monthly"] ?? 0;
                          const selectedCost = isAnnual ? plan.yearlyPrice : plan.price;
                          if (selectedCost > currentCost) return `Mejorar a ${plan.name}`;
                          return `Cambiar a ${plan.name}`;
                        })()}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Enterprise CTA ── */}
      <div className="max-w-[1100px] mx-auto">
        <div className="relative overflow-hidden rounded-[20px] p-8 sm:p-10 bg-gradient-to-br from-primary to-primary-600 dark:from-primary/[0.18] dark:via-primary/[0.10] dark:to-surface-elevated dark:bg-surface-elevated border border-white/10 dark:border-border">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/[0.04] dark:bg-primary/[0.04] pointer-events-none" />
          <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/[0.03] dark:bg-primary/[0.03] pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-15"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-[12px] bg-white/10 dark:bg-primary/15 flex items-center justify-center shrink-0 border border-white/10 dark:border-primary/20">
                <MessageSquare className="h-5 w-5 text-white dark:text-primary" />
              </div>
              <div>
                <p className="text-[16px] font-bold text-white dark:text-fg leading-snug">
                  ¿Necesitas una solución personalizada?
                </p>
                <p className="text-[13px] text-white/60 dark:text-fg-secondary mt-1 leading-relaxed max-w-md">
                  Infraestructura dedicada, SLAs personalizados y soporte técnico a medida.
                </p>
              </div>
            </div>
            <button
              className="shrink-0 h-11 px-6 rounded-xl bg-white text-primary dark:bg-primary dark:text-primary-foreground text-[13px] font-medium transition-all hover:bg-white/90 dark:hover:bg-primary-600 active:scale-[0.98] whitespace-nowrap"
              onClick={() => {}}
            >
              Hablar con Ventas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
