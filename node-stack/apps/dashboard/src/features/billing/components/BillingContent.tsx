import { FC, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/stores/useAuth";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, Skeleton } from "@node-stack/ui";
import { appToast } from "@/components/alerts/Toasts";
import { ConfirmDialog } from "@node-stack/ui";
import { PlanCard } from "./PlanCard";
import { PaymentMethodCard, type PaymentMethod } from "./PaymentMethodCard";
import { PaymentHistory, type PaymentRecord } from "./PaymentHistory";
import { SupportCard } from "./SupportCard";
import { AddCardModal } from "./AddCardModal";
import { Loader2 } from "lucide-react";
import { useSubscription, useInvoices, usePaymentMethods, useCancelSubscription } from "../hooks/useBilling";

export const BillingContent: FC = () => {
  const navigate = useNavigate();
  const { isPremium } = useAuth();
  
  const { data: subscription, isLoading: isLoadingSub } = useSubscription();
  const { data: invoices, isLoading: isLoadingInvoices } = useInvoices();
  const { data: paymentMethods, isLoading: isLoadingMethods } = usePaymentMethods();
  const cancelMutation = useCancelSubscription();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Orchestration handlers
  const handleAddCard = async () => {
    // In a real app, this would use a mutation
    appToast.info({ title: "Acción requerida", description: "El procesamiento de tarjetas debe integrarse con Stripe Elements." });
    setIsModalOpen(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleUpgrade = () => navigate("/payments/pricing");

  const handleCancelPlan = () => setIsCancelModalOpen(true);

  const executeCancelPlan = async () => {
    try {
      await cancelMutation.mutateAsync();
      setIsCancelModalOpen(false);
      appToast.success({ title: "Plan anulado", description: "Tu plan pasará a Starter al final del ciclo actual." });
    } catch (err) {
      appToast.error({ title: "Error", description: "No pudimos procesar la cancelación." });
    }
  };

  const handleContactSupport = () => {
    appToast.info({ title: "Soporte de pagos", description: "Contáctanos en soporte@nodestack.com" });
  };

  // Memoized values
  const planInfo = useMemo(() => ({
    name: subscription?.planName || (isPremium ? "Pro Enterprise" : "Plan Gratuito"),
    price: isPremium ? "$29.00" : "$0.00",
    daysRemaining: 5,
    nextBillingDate: subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "15 de Mayo, 2026",
  }), [subscription, isPremium]);

  const mappedPayments: PaymentRecord[] = useMemo(() => 
    (invoices || []).map(inv => ({
      id: inv.id,
      date: new Date(inv.created).toLocaleDateString(),
      amount: `$${inv.amountPaid / 100}`, // Assuming cents
      status: inv.status === "paid" ? "Pagado" : "Pendiente",
      method: "Visa" // Mocking method for now
    })), [invoices]);

  const mappedMethods: PaymentMethod[] = useMemo(() => 
    (paymentMethods || []).map(m => ({
      id: m.id,
      type: m.brand || "Card",
      last4: m.last4,
      expiry: `${m.expiryMonth}/${m.expiryYear}`,
      isDefault: m.isDefault
    })), [paymentMethods]);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <PageHeader
        title="Pagos y Suscripción"
        description="Gestiona tu plan actual, métodos de pago e historial de facturas."
      />

      {/* Plan & Payment Method */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoadingSub ? (
          <Skeleton className="h-64 rounded-[32px]" />
        ) : (
          <PlanCard
            isPremium={isPremium}
            planName={planInfo.name}
            price={planInfo.price}
            daysRemaining={planInfo.daysRemaining}
            nextBillingDate={planInfo.nextBillingDate}
            onUpgrade={handleUpgrade}
            onCancel={handleCancelPlan}
          />
        )}
        {isLoadingMethods ? (
          <Skeleton className="h-64 rounded-[32px]" />
        ) : (
          <PaymentMethodCard
            methods={mappedMethods}
            onAdd={handleAddClick}
            onEdit={handleEditClick}
          />
        )}
      </div>

      {/* Payment History */}
      <div className="space-y-5 pt-4">
        <h2 className="text-xl font-heading text-gray-950 dark:text-white">Historial de Facturas</h2>
        <Card className="card-premium p-2 md:p-4">
          {isLoadingInvoices ? (
            <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : (
            <PaymentHistory payments={mappedPayments} />
          )}
        </Card>
      </div>

      {/* Support Card */}
      <SupportCard onContactSupport={handleContactSupport} />

      {/* Modals */}
      <AddCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCard}
        isEditing={isEditing}
        isSubmitting={false}
      />

      <ConfirmDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={executeCancelPlan}
        title="Cancelar Suscripción"
        description="Si cancelas ahora, mantendrás el acceso a los beneficios Pro hasta el final de tu ciclo de facturación actual. ¿Estás seguro de continuar?"
        confirmText="Sí, anular plan"
        cancelText="Mantener mi plan"
        variant="danger"
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
};