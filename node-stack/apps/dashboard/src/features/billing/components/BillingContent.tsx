import { ConfirmDialog, Skeleton } from "@node-stack/ui";
import { ExternalLink } from "lucide-react";
import { FC, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";


import { BillingLayoutSkeleton } from "./BillingSkeletons";
import { PaymentHistory, type PaymentRecord } from "./PaymentHistory";
import { PlanCard } from "./PlanCard";
import { SupportCard } from "./SupportCard";
import { useSubscription, useInvoices, useCancelSubscription, useCustomerPortal, useRefreshSubscription, useUncancelSubscription } from "../hooks/useBilling";

import { appToast } from "@/components/alerts/Toasts";

export const BillingContent: FC = () => {
  const navigate = useNavigate();

  const { data: subscription, isLoading: isLoadingSub } = useSubscription();
  const { data: invoices, isLoading: isLoadingInvoices } = useInvoices();
  const cancelMutation = useCancelSubscription();
  const uncancelMutation = useUncancelSubscription();
  const portalMutation = useCustomerPortal();
  const refreshMutation = useRefreshSubscription();

  // Sync subscription state from Polar on mount to pick up portal-side changes
  // (cancellations, plan changes) that didn't reach our API via webhook.
  useEffect(() => {
    refreshMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [pendingSection, setPendingSection] = useState<"payment" | "orders" | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleUpgrade = () => navigate("/payments/pricing");

  const handleOpenPortal = async (section: "payment" | "orders") => {
    setPendingSection(section);
    try {
      const portalSection = section === "orders" ? "orders" : undefined;
      const result = await portalMutation.mutateAsync({ section: portalSection });
      if (result?.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else {
        appToast.info({ title: "Portal no disponible", description: "No hay una suscripción activa." });
      }
    } catch {
      appToast.error({ title: "Error", description: "No se pudo abrir el portal." });
    } finally {
      setPendingSection(null);
    }
  };

  const handleReactivate = async () => {
    try {
      await uncancelMutation.mutateAsync();
      appToast.success({
        title: "Suscripción reactivada",
        description: "Tu plan continuará al finalizar el ciclo actual.",
      });
    } catch {
      appToast.error({ title: "Error", description: "No se pudo reactivar la suscripción." });
    }
  };

  const executeCancelPlan = async () => {
    try {
      await cancelMutation.mutateAsync();
      setIsCancelModalOpen(false);
      appToast.success({
        title: "Cancelación programada",
        description: "Mantendrás el acceso hasta el final del ciclo actual.",
      });
    } catch {
      appToast.error({ title: "Error", description: "No pudimos procesar la cancelación." });
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const planInfo = useMemo(() => {
    const sub = subscription;
    const hasActiveSubscription = sub && sub.status !== "none" && sub.status !== "cancelled" && sub.status !== "canceled";
    const status: string = sub?.status ?? "none";
    const isTrialing = status === "trialing" || status === "trialling";

    const interval = sub?.interval ?? "monthly";
    const planPrice = sub?.planId === "elite"
      ? (interval === "yearly" ? 990 : 99)
      : (interval === "yearly" ? 290 : 29);

    const cancelAtDate = sub?.cancelAt || null;
    const periodEndDate = sub?.currentPeriodEnd || null;
    const refDate = cancelAtDate ?? periodEndDate;

    return {
      planId: sub?.planId ?? "pro",
      name: sub?.planName ?? "Growth",
      interval,
      price: hasActiveSubscription ? `$${planPrice}` : "$0",
      status: hasActiveSubscription ? status : "none",
      trialEndsAt: isTrialing && periodEndDate ? periodEndDate : undefined,
      cancelAt: cancelAtDate ?? undefined,
      daysRemaining: refDate
        ? Math.max(0, Math.ceil((new Date(refDate).getTime() - Date.now()) / 86_400_000))
        : 0,
      nextBillingDate: periodEndDate
        ? new Date(periodEndDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
        : "",
      isPremium: !!hasActiveSubscription,
    };
  }, [subscription]);

  const invoicesData = useMemo<PaymentRecord[]>(() =>
    (invoices ?? []).map(inv => ({
      id: inv.id,
      number: inv.number,
      date: inv.date ? new Date(inv.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "N/A",
      amount: `$${(inv.amount / 100).toFixed(2)}`,
      status: inv.status === "paid" ? "Pagado" : inv.status.charAt(0).toUpperCase() + inv.status.slice(1),
      pdfUrl: inv.invoiceUrl ?? inv.pdfUrl,
    })),
    [invoices]
  );

  const isInitialLoad = isLoadingSub && isLoadingInvoices;
  if (isInitialLoad) return <BillingLayoutSkeleton />;

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase text-fg-muted mb-1">
            Cuenta
          </p>
          <h1 className="text-xl sm:text-2xl font-heading text-fg leading-tight">
            Pagos y Suscripción
          </h1>
          <p className="text-[13px] text-fg-muted mt-0.5">
            Gestiona tu plan, métodos de pago e historial de facturas.
          </p>
        </div>
      </div>

      {/* ── Plan + Payment Methods ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoadingSub ? (
          <Skeleton className="h-[340px] rounded-[20px]" />
        ) : (
          <PlanCard
            isPremium={planInfo.isPremium}
            planId={planInfo.planId}
            planName={planInfo.name}
            price={planInfo.price}
            interval={planInfo.interval}
            status={planInfo.status}
            trialEndsAt={planInfo.trialEndsAt}
            cancelAt={planInfo.cancelAt}
            daysRemaining={planInfo.daysRemaining}
            nextBillingDate={planInfo.nextBillingDate}
            onUpgrade={handleUpgrade}
            onCancel={() => setIsCancelModalOpen(true)}
            onReactivate={handleReactivate}
            isReactivating={uncancelMutation.isPending}
          />
        )}

        {/* Payment methods — managed via Polar portal (PCI compliance) */}
        <div className="rounded-[20px] border border-border bg-white dark:bg-surface overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-[14px] font-semibold text-fg">Métodos de pago</h3>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 text-center gap-4">
            <p className="text-[13px] text-fg-muted leading-relaxed max-w-xs">
              Los métodos de pago se gestionan de forma segura a través del portal de Polar,
              cumpliendo con PCI-DSS.
            </p>
            <button
              onClick={() => handleOpenPortal("payment")}
              disabled={pendingSection === "payment"}
              className="inline-flex items-center gap-2 h-9 px-5 rounded-xl border border-border text-[13px] font-medium text-fg hover:bg-surface-hover transition-all active:scale-[0.98] disabled:opacity-60"
            >
              <ExternalLink className="h-3.5 w-3.5 text-fg-muted" />
              {pendingSection === "payment" ? "Abriendo..." : "Gestionar métodos de pago"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Invoice history ── */}
      {isLoadingInvoices ? (
        <Skeleton className="h-48 rounded-[20px]" />
      ) : invoicesData.length > 0 ? (
        <PaymentHistory payments={invoicesData} isLoading={false} />
      ) : (
        <div className="rounded-[20px] border border-border bg-white dark:bg-surface px-6 py-8 flex flex-col items-center text-center gap-3">
          <p className="text-[14px] font-semibold text-fg">Historial de facturas</p>
          <p className="text-[13px] text-fg-muted max-w-sm leading-relaxed">
            Las facturas de tus pagos aparecerán aquí. También puedes verlas en el portal de Polar.
          </p>
          <button
            onClick={() => handleOpenPortal("orders")}
            disabled={pendingSection === "orders"}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-xl border border-border text-[13px] font-medium text-fg hover:bg-surface-hover transition-all active:scale-[0.98] disabled:opacity-60"
          >
            <ExternalLink className="h-3.5 w-3.5 text-fg-muted" />
            {pendingSection === "orders" ? "Abriendo..." : "Ver historial en Polar"}
          </button>
        </div>
      )}

      {/* ── Support CTA ── */}
      <SupportCard
        onContactSupport={() =>
          appToast.info({ title: "Soporte de pagos", description: "Contáctanos en soporte@nodestack.com" })
        }
      />

      {/* ── Cancel confirm ── */}
      <ConfirmDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={executeCancelPlan}
        title="Cancelar Suscripción"
        description="Si cancelas ahora, mantendrás el acceso a los beneficios hasta el final de tu ciclo de facturación actual. ¿Estás seguro?"
        confirmText="Sí, cancelar plan"
        cancelText="Mantener mi plan"
        variant="danger"
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
};
