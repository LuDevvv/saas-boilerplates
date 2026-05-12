/**
 * Checkout page — Polar.sh embedded checkout
 *
 * Flow:
 *  1. User selects a plan → redirected here with query params
 *  2. They confirm their email and review the order summary
 *  3. On submit → api.billing.createCheckout() → Polar checkout URL
 *  4. PolarEmbedCheckout.create() opens an inline iframe overlay
 *     (no page redirect — user stays in our app)
 *  5. On success → navigate to /payments/success
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@node-stack/ui";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Loader2,
  Mail,
  ShieldCheck,
  Zap,
  Lock,
  Tag,
} from "lucide-react";
import { FC, useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import * as z from "zod";

import { appToast } from "@/components/alerts/Toasts";
import { BackButton } from "@/components/shared/BackButton";
import { useCheckout, useRefreshSubscription } from "@/features/billing/hooks/useBilling";
import { useWorkspaces } from "@/features/workspaces/hooks/useWorkspaces";
import { useAuth } from "@/hooks/stores/useAuth";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { cn } from "@/utils/classNames";

// ─── Schema ───────────────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

// ─── Plan catalog ─────────────────────────────────────────────────────────────

const PLANS: Record<string, {
  name: string;
  description: string;
  price: number;
  yearlyPrice: number;
  features: string[];
}> = {
  free: {
    name: "Starter",
    description: "Para individuos y proyectos pequeños.",
    price: 0,
    yearlyPrice: 0,
    features: ["Hasta 3 proyectos activos", "Analíticas básicas", "Soporte por email"],
  },
  pro: {
    name: "Growth",
    description: "Para equipos en crecimiento que necesitan escalar.",
    price: 29,
    yearlyPrice: 290,
    features: [
      "Proyectos ilimitados",
      "Analíticas avanzadas",
      "Soporte prioritario 24/7",
      "10 GB de almacenamiento",
      "Exportación de datos",
      "Acceso API",
    ],
  },
  elite: {
    name: "Unlimited",
    description: "Infraestructura dedicada para organizaciones.",
    price: 99,
    yearlyPrice: 990,
    features: [
      "Todo lo de Growth",
      "Infraestructura dedicada",
      "SLA del 99.99%",
      "Almacenamiento ilimitado",
      "Manager dedicado",
    ],
  },
};

// ─── Order summary ────────────────────────────────────────────────────────────

interface SummaryProps {
  planName: string;
  basePrice: number;
  isYearly: boolean;
  savings: number;
  trialDays?: number;
  isMobile?: boolean;
}

const OrderSummary: FC<SummaryProps> = ({ planName, basePrice, isYearly, savings, trialDays = 0, isMobile }) => {
  const textMuted  = isMobile ? "text-fg-muted"     : "text-white/45";
  const textNormal = isMobile ? "text-fg"           : "text-white/80";
  const textBold   = isMobile ? "text-fg font-bold" : "text-white font-bold";
  const isTrial    = trialDays > 0;

  return (
    <div className={cn(
      "space-y-5",
      isMobile && "bg-surface-muted rounded-[18px] border border-border p-5"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("text-[14px] font-semibold", textNormal)}>Plan {planName}</p>
          <p className={cn("text-[11px] mt-0.5", textMuted)}>
            {isTrial ? `Prueba gratuita · ${trialDays} días` : isYearly ? "Facturación anual" : "Facturación mensual"}
          </p>
        </div>
        <p className={cn("text-[14px] shrink-0 font-semibold", isTrial ? "text-emerald-400" : textNormal)}>
          {isTrial ? "Gratis" : `US$ ${basePrice}.00`}
        </p>
      </div>

      {isTrial && (
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-[10px]",
          isMobile ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-white/[0.07]"
        )}>
          <Tag className={cn("h-3.5 w-3.5 shrink-0", isMobile ? "text-emerald-600 dark:text-emerald-400" : "text-white/60")} />
          <p className={cn("text-[11px] font-semibold", isMobile ? "text-emerald-600 dark:text-emerald-400" : "text-white/60")}>
            Después de la prueba: US$ {basePrice}.00/{isYearly ? "año" : "mes"}
          </p>
        </div>
      )}

      {!isTrial && isYearly && savings > 0 && (
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-[10px]",
          isMobile ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-white/[0.07]"
        )}>
          <Tag className={cn("h-3.5 w-3.5 shrink-0", isMobile ? "text-emerald-600 dark:text-emerald-400" : "text-white/60")} />
          <p className={cn("text-[11px] font-semibold", isMobile ? "text-emerald-600 dark:text-emerald-400" : "text-white/60")}>
            Ahorro anual de US$ {savings}.00
          </p>
        </div>
      )}

      <div className={cn(
        "flex items-center justify-between pt-4 border-t",
        isMobile ? "border-border" : "border-white/10"
      )}>
        <p className={cn("text-[13px] font-semibold uppercase", textMuted)}>
          {isTrial ? "Hoy" : "Total hoy"}
        </p>
        <p className={cn("text-[20px] font-semibold tabular-nums leading-none", textBold)}>
          {isTrial ? "US$ 0.00" : `US$ ${basePrice}.00`}
          {!isTrial && (
            <span className={cn("text-[12px] font-normal ml-1", textMuted)}>
              /{isYearly ? "año" : "mes"}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const Checkout: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const [showSummary, setShowSummary]       = useState(false);
  const [isEmbedLoading, setIsEmbedLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkoutRef      = useRef<any>(null);
  const pollIdRef        = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const fallbackPollRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const stopPolling = useCallback(() => {
    clearInterval(pollIdRef.current);
    pollIdRef.current = undefined;
    clearTimeout(fallbackPollRef.current);
    fallbackPollRef.current = undefined;
  }, []);

  // On unmount: stop polling AND force-close the embed iframe.
  // The embed is injected into document.body (outside React tree) so it won't
  // auto-remove when this component unmounts — we must close it explicitly.
  useEffect(() => () => {
    stopPolling();
    checkoutRef.current?.close();
    checkoutRef.current = null;
  }, [stopPolling]);

  // Ensure workspace context is set so X-Workspace-ID header is sent
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const { data: workspaces } = useWorkspaces();

  useEffect(() => {
    if (!activeWorkspaceId && Array.isArray(workspaces) && workspaces.length > 0) {
      setActiveWorkspace((workspaces[0] as { id: string }).id);
    }
  }, [activeWorkspaceId, workspaces, setActiveWorkspace]);

  const planId       = searchParams.get("plan")    || "pro";
  const billing      = searchParams.get("billing") || "monthly";
  const trialDays    = parseInt(searchParams.get("trial") || "0", 10);
  const isOnboarding = searchParams.get("onboarding") === "true";

  const isYearly     = billing === "yearly";
  const plan         = PLANS[planId] ?? PLANS["pro"]!;
  const basePrice    = isYearly ? plan.yearlyPrice : plan.price;
  const monthlyEquiv = isYearly ? Math.round(plan.yearlyPrice / 12) : plan.price;
  const annualSavings = isYearly ? plan.price * 12 - plan.yearlyPrice : 0;
  const isFree       = plan.price === 0;

  const { toDOP } = useExchangeRate();
  const { mutateAsync: createCheckout, isPending } = useCheckout();

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(checkoutSchema as any),
    defaultValues: { email: user?.email ?? "" },
  });

  const { mutateAsync: refreshSubscription } = useRefreshSubscription();

  // Detect dark mode from the document root class
  const embedTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";

  const onSubmit = useCallback(async (_data: CheckoutForm) => {
    setIsEmbedLoading(true);
    try {
      const result = await createCheckout({
        planId,
        variantId: billing,
        successUrl: `${window.location.origin}/payments/success`,
        cancelUrl: window.location.href,
      });

      const checkout = await PolarEmbedCheckout.create(result.url, {
        theme: embedTheme,
      });

      checkoutRef.current = checkout;

      // Shared polling logic — polls refreshSubscription until active subscription found.
      // refreshSubscription calls Polar's API directly when no DB record exists,
      // so this works even when webhooks can't reach our backend (dev / ngrok down).
      const startPoll = () => {
        if (pollIdRef.current) return; // already polling
        let pollAttempts = 0;
        pollIdRef.current = setInterval(async () => {
          if (++pollAttempts > 30) { stopPolling(); return; } // 90s max
          try {
            const sub = await refreshSubscription();
            if (sub?.status === "active" || sub?.status === "trialing") {
              stopPolling();
              // Force-close embed before navigating — close() bypasses the
              // "confirmed" lock and directly removes the iframe from document.body.
              checkoutRef.current?.close();
              navigate("/payments/success");
            }
          } catch { /* ignore — keep polling */ }
        }, 3000);
      };

      // "loaded" fires when the iframe finishes rendering.
      // Also start a fallback poll 15s later in case "confirmed" never fires
      // (e.g. Google Pay / Apple Pay quick-pay or event propagation failure).
      checkout.addEventListener("loaded", () => {
        setIsEmbedLoading(false);
        fallbackPollRef.current = setTimeout(startPoll, 15_000);
      });

      // "confirmed" fires when the user clicks Pay inside the embed.
      // Speed up from fallback cadence to immediate 3s polling.
      checkout.addEventListener("confirmed", () => {
        clearTimeout(fallbackPollRef.current);
        fallbackPollRef.current = undefined;
        startPoll();
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      checkout.addEventListener("success", (event: any) => {
        stopPolling();
        // Prevent Polar's automatic redirect — we handle navigation ourselves
        event.preventDefault?.();
        checkoutRef.current?.close();
        navigate("/payments/success");
      });

      checkout.addEventListener("close", () => {
        stopPolling();
        checkoutRef.current = null;
        setIsEmbedLoading(false);
      });
    } catch {
      setIsEmbedLoading(false);
      appToast.error({ title: "Error al procesar el pago", description: "No pudimos generar la sesión de pago. Inténtalo de nuevo." });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, billing, embedTheme, navigate, createCheckout, refreshSubscription, stopPolling]);

  return (
    <div className="min-h-screen bg-[var(--canvas)] dark:bg-canvas flex flex-col lg:flex-row animate-in fade-in duration-500">

      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex w-[38%] flex-col justify-between sticky top-0 h-screen overflow-y-auto custom-scrollbar"
        style={{ background: "linear-gradient(160deg, #004080 0%, #002D5A 100%)" }}
      >
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/[0.03] pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-white/[0.03] pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />

        <div className="relative z-10 p-12 flex flex-col h-full">
          <button
            onClick={() => navigate(isOnboarding ? "/onboarding/pricing" : "/payments/pricing")}
            className="flex items-center gap-2.5 mb-10 group w-fit text-white/50 hover:text-white transition-colors duration-200"
          >
            <div className="h-7 w-7 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center group-hover:bg-white/[0.15] transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
            </div>
            <span className="text-[12px] font-medium">Cancelar</span>
          </button>

          {/* Plan preview */}
          <div className="mb-6">
            <p className="text-white/40 text-[11px] font-medium uppercase mb-2">
              {isFree ? "Activando" : "Suscribiéndote a"}
            </p>
            <h2 className="text-[28px] font-semibold text-white leading-tight">
              Plan {plan.name}
            </h2>
            <p className="text-white/50 text-[13px] mt-0.5">{plan.description}</p>

            <div className="mt-5 space-y-2.5">
              {plan.features.slice(0, 3).map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#00E6E6] shrink-0 opacity-90" />
                  <span className="text-white/65 text-[13px]">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.10] mb-6" />

          {/* Receipt breakdown */}
          <div className="space-y-3">
            {isYearly && annualSavings > 0 ? (
              <>
                {/* Show original cost (monthly × 12) so the math is legible */}
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-white/50">
                    Plan {plan.name} · 12 meses
                  </span>
                  <span className="text-white/40 tabular-nums line-through">
                    US$ {basePrice + annualSavings}.00
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-emerald-400">Descuento anual</span>
                  <span className="text-emerald-400 tabular-nums">-US$ {annualSavings}.00</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-white/50">
                  Plan {plan.name} · mensual
                </span>
                <span className="text-white/75 tabular-nums">US$ {basePrice}.00</span>
              </div>
            )}

            <div className="flex items-start justify-between pt-3.5 border-t border-white/[0.12] mt-1">
              <div>
                <p className="text-white text-[14px] font-semibold">Total hoy</p>
                <p className="text-white/35 text-[11px] mt-0.5">
                  {isYearly ? "Cargo anual único" : "Se renueva mensualmente"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white text-[22px] font-semibold tabular-nums leading-none">
                  US$ {basePrice}.00
                </p>
                {!isFree && toDOP(basePrice) && (
                  <p className="text-white/35 text-[11px] mt-1">≈ {toDOP(basePrice)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] space-y-3">
            {[
              "Acceso inmediato al activar",
              "Cancela o pausa en cualquier momento",
              "Soporte incluido en tu plan",
            ].map(point => (
              <div key={point} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-white/[0.08] flex items-center justify-center shrink-0 border border-white/[0.10]">
                  <CheckCircle2 className="h-3 w-3 text-white/60" />
                </div>
                <span className="text-white/50 text-[12px] leading-snug">{point}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-10 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-white/20 text-[10px] uppercase font-bold">Seguridad bancaria</span>
            <div className="flex gap-4 text-white/20 text-[10px]">
              <button onClick={() => navigate("/legal/terms")} className="hover:text-white/40 transition-colors">Términos</button>
              <button onClick={() => navigate("/legal/privacy")} className="hover:text-white/40 transition-colors">Privacidad</button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto px-5 py-8 sm:px-10 md:px-16 lg:px-20 lg:py-16">
        <div className="max-w-xl mx-auto">

          <div className="lg:hidden mb-6">
            <BackButton
              label="Volver a planes"
              to={isOnboarding ? "/onboarding/pricing" : "/payments/pricing"}
            />
          </div>

          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase text-primary/70 dark:text-primary/60 mb-1">
              Paso final
            </p>
            <h1 className="text-2xl sm:text-3xl font-heading text-fg leading-tight">
              Confirmar suscripción
            </h1>
            <p className="text-[13px] text-fg-muted mt-1">
              {isFree
                ? "Activa tu cuenta gratuita sin tarjeta de crédito."
                : "El pago es procesado de forma segura por Polar."}
            </p>
          </div>

          {/* Mobile order summary */}
          <div className="lg:hidden mb-8">
            <button
              onClick={() => setShowSummary(v => !v)}
              className="w-full flex items-center justify-between p-4 rounded-[16px] border border-border bg-surface-muted hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[10px] bg-primary/10 flex items-center justify-center shrink-0">
                  <Tag className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] text-fg-muted">Resumen del pedido</p>
                  <p className="text-[15px] font-semibold text-fg tabular-nums">
                    {trialDays > 0 ? "US$ 0.00" : `US$ ${basePrice}.00`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[12px] text-fg-muted">
                {showSummary ? "Ocultar" : "Ver"}
                {showSummary ? <ChevronUp className="h-4 w-4 ml-0.5" /> : <ChevronDown className="h-4 w-4 ml-0.5" />}
              </div>
            </button>

            {showSummary && (
              <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                <OrderSummary
                  planName={plan.name}
                  basePrice={basePrice}
                  isYearly={isYearly}
                  savings={annualSavings}
                  trialDays={trialDays}
                  isMobile
                />
              </div>
            )}
          </div>

          {/* Plan preview card */}
          <div className="mb-8 rounded-[20px] border border-border bg-surface overflow-hidden">
            <div className="h-[3px]" style={{ background: "linear-gradient(to right, #4D94DB, #004080)" }} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-[12px] text-fg-muted font-medium">Seleccionaste</p>
                  <h3 className="text-[18px] font-bold text-fg mt-0.5">
                    Plan {plan.name}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[22px] font-semibold text-fg tabular-nums leading-none">
                    ${isFree ? "0" : monthlyEquiv}
                    <span className="text-[12px] font-normal text-fg-muted ml-1">/mes</span>
                  </p>
                  {isYearly && !isFree && (
                    <p className="text-[10px] text-fg-muted mt-0.5">
                      Pago anual · US$ {plan.yearlyPrice}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <span className="text-[12px] text-fg-secondary">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase text-fg-muted">
                  Correo electrónico
                </label>
                {user?.email && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Autocompletado desde tu cuenta
                  </span>
                )}
              </div>
              <Input
                icon={Mail}
                placeholder="tu@email.com"
                className="h-11 rounded-xl text-[14px]"
                {...register("email")}
                error={errors.email?.message}
                autoFocus={!user?.email}
              />
              <p className="text-[11px] text-fg-muted">
                Polar enviará el recibo a este correo. Puedes cambiarlo si necesitas facturar a otra cuenta.
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending || isEmbedLoading}
              className={cn(
                "w-full rounded-xl text-white text-[14px] font-semibold transition-colors",
                "shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
              style={{ background: "linear-gradient(to right, #4D94DB, #004080)", height: "52px" }}
            >
              {(isPending || isEmbedLoading) ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isPending ? "Preparando pago..." : "Abriendo formulario..."}
                </>
              ) : isFree ? (
                <>
                  <Zap className="h-5 w-5" />
                  Activar Plan Gratuito
                </>
              ) : trialDays > 0 ? (
                <>
                  <Lock className="h-4 w-4 opacity-80" />
                  Iniciar prueba gratuita de {trialDays} días
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 opacity-80" />
                  Pagar US$ {basePrice}.00 de forma segura
                </>
              )}
            </button>

            {!isFree && (
              <p className="text-[11px] text-fg-muted text-center">
                <Tag className="inline h-3 w-3 mr-1 opacity-60" />
                ¿Tienes un código de descuento? Podrás ingresarlo dentro del formulario de pago.
              </p>
            )}

            {!isFree && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">
                <div className="flex items-center gap-2 text-[11px] text-fg-muted">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  Cifrado TLS 256-bit
                </div>
                <div className="hidden sm:block h-3 w-px bg-border" />
                <div className="flex items-center gap-2 text-[11px] text-fg-muted">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  Pago gestionado por Polar.sh
                </div>
                <div className="hidden sm:block h-3 w-px bg-border" />
                <div className="flex items-center gap-2 text-[11px] text-fg-muted">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Cancela cuando quieras
                </div>
              </div>
            )}

            <p className="text-[11px] text-fg-muted text-center leading-relaxed px-4">
              Al continuar, aceptas nuestros{" "}
              <button type="button" onClick={() => navigate("/legal/terms")} className="underline hover:text-primary transition-colors">
                Términos de Servicio
              </button>{" "}
              y{" "}
              <button type="button" onClick={() => navigate("/legal/privacy")} className="underline hover:text-primary transition-colors">
                Política de Privacidad
              </button>
              . El cargo se realiza de forma automática según el ciclo{" "}
              {isYearly ? "anual" : "mensual"}.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
