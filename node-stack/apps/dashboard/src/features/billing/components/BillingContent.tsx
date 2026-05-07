import { FC, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/stores/useAuth";
import { ConfirmDialog, Skeleton } from "@node-stack/ui";
import { appToast } from "@/components/alerts/Toasts";
import { PlanCard } from "./PlanCard";
import { PaymentMethodCard, type PaymentMethod } from "./PaymentMethodCard";
import { PaymentHistory, type PaymentRecord } from "./PaymentHistory";
import { SupportCard } from "./SupportCard";
import { AddCardModal } from "./AddCardModal";
import { BillingLayoutSkeleton } from "./BillingSkeletons";
import { useSubscription, useInvoices, usePaymentMethods, useCancelSubscription } from "../hooks/useBilling";

// ─── Demo data — displayed when API stubs return empty (remove for production) ─

const DEMO_METHODS: PaymentMethod[] = [
  { id: "demo-1", type: "Visa", last4: "4242", expiry: "12/26", isDefault: true },
  { id: "demo-2", type: "Mastercard", last4: "8888", expiry: "08/27", isDefault: false },
];

const DEMO_INVOICES: PaymentRecord[] = [
  { id: "INV-2026-003", number: "INV-2026-003", date: "1 may 2026", amount: "$29.00", status: "Pagado", pdfUrl: undefined },
  { id: "INV-2026-002", number: "INV-2026-002", date: "1 abr 2026", amount: "$29.00", status: "Pagado", pdfUrl: undefined },
  { id: "INV-2026-001", number: "INV-2026-001", date: "1 mar 2026", amount: "$29.00", status: "Pendiente", pdfUrl: undefined },
];

export const BillingContent: FC = () => {
  const navigate = useNavigate();
  const { isPremium } = useAuth();

  const { data: subscription, isLoading: isLoadingSub } = useSubscription();
  const { data: invoices, isLoading: isLoadingInvoices } = useInvoices();
  const { data: paymentMethods, isLoading: isLoadingMethods } = usePaymentMethods();
  const cancelMutation = useCancelSubscription();

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddCard = async () => {
    appToast.info({
      title: "Integración requerida",
      description: "El procesamiento de tarjetas debe conectarse con Stripe Elements.",
    });
    setIsCardModalOpen(false);
  };

  const handleDeleteMethod = (id: string) => {
    appToast.info({
      title: "En desarrollo",
      description: `La eliminación del método ${id} requiere integración con Stripe.`,
    });
  };

  const handleSetDefault = (id: string) => {
    appToast.info({
      title: "En desarrollo",
      description: `Cambiar el método principal ${id} requiere integración con Stripe.`,
    });
  };

  const handleUpgrade = () => navigate("/payments/pricing");

  const executeCancelPlan = async () => {
    try {
      await cancelMutation.mutateAsync({});
      setIsCancelModalOpen(false);
      appToast.success({
        title: "Plan cancelado",
        description: "Mantendrás el acceso hasta el final del ciclo actual.",
      });
    } catch {
      appToast.error({ title: "Error", description: "No pudimos procesar la cancelación." });
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const planInfo = useMemo(() => {
    const sub = subscription as any;
    return {
      planId: sub?.planId || (isPremium ? "pro" : "free"),
      name: sub?.planName || (isPremium ? "Growth" : "Starter"),
      price: isPremium ? "$29.00" : "$0.00",
      daysRemaining: sub?.currentPeriodEnd
        ? Math.max(0, Math.ceil((new Date(sub.currentPeriodEnd).getTime() - Date.now()) / 86_400_000))
        : 0,
      nextBillingDate: sub?.currentPeriodEnd
        ? new Date(sub.currentPeriodEnd).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
        : "",
    };
  }, [subscription, isPremium]);

  const invoicesData = useMemo(() =>
    (invoices || []).map(inv => ({
      id: inv.id,
      number: inv.number,
      date: inv.date ? new Date(inv.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "N/A",
      amount: `$${(inv.amount / 100).toFixed(2)}`,
      status: inv.status === "paid" ? "Pagado" : inv.status.charAt(0).toUpperCase() + inv.status.slice(1),
      pdfUrl: inv.pdfUrl,
    })),
    [invoices]
  );

  const mappedMethods: PaymentMethod[] = useMemo(() =>
    (paymentMethods || []).map(m => ({
      id: m.id,
      type: m.brand || "Card",
      last4: m.last4,
      expiry: `${String(m.expiryMonth).padStart(2, "0")}/${m.expiryYear}`,
      isDefault: m.isDefault,
    })),
    [paymentMethods]
  );

  // Show full-page skeleton on initial simultaneous load
  const isInitialLoad = isLoadingSub && isLoadingInvoices && isLoadingMethods;
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

      {/* ── Plans + Payment Methods ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoadingSub ? (
          <Skeleton className="h-[340px] rounded-[20px]" />
        ) : (
          <PlanCard
            isPremium={isPremium}
            planId={planInfo.planId}
            planName={planInfo.name}
            price={planInfo.price}
            daysRemaining={planInfo.daysRemaining}
            nextBillingDate={planInfo.nextBillingDate}
            onUpgrade={handleUpgrade}
            onCancel={() => setIsCancelModalOpen(true)}
          />
        )}

        <PaymentMethodCard
          methods={isLoadingMethods ? [] : (mappedMethods.length > 0 ? mappedMethods : DEMO_METHODS)}
          isLoading={isLoadingMethods}
          onAdd={() => { setIsEditing(false); setIsCardModalOpen(true); }}
          onDelete={handleDeleteMethod}
          onSetDefault={handleSetDefault}
        />
      </div>

      {/* ── Invoice history ── */}
      <PaymentHistory
        payments={isLoadingInvoices ? [] : (invoicesData.length > 0 ? invoicesData : DEMO_INVOICES)}
        isLoading={isLoadingInvoices}
      />

      {/* ── Support CTA ── */}
      <SupportCard
        onContactSupport={() =>
          appToast.info({ title: "Soporte de pagos", description: "Contáctanos en soporte@nodestack.com" })
        }
      />

      {/* ── Add card drawer ── */}
      <AddCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSubmit={handleAddCard}
        isEditing={isEditing}
        isSubmitting={false}
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
