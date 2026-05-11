import { ArrowUpCircle, Zap, Clock } from "lucide-react";
import { FC, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useSubscription } from "@/features/billing/hooks/useBilling";

interface SidebarWidgetProps {
  isCollapsed: boolean;
}

// ─── Circular progress (for trial countdown) ──────────────────────────────────

const CircularProgress: FC<{ daysLeft: number; progress: number }> = ({ daysLeft, progress }) => (
  <div className="h-9 w-9 relative shrink-0">
    <svg className="h-full w-full -rotate-90" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="none" className="stroke-muted/10" strokeWidth="3" />
      <circle
        cx="12" cy="12" r="10" fill="none"
        className="stroke-primary"
        strokeWidth="3"
        strokeDasharray="62.8"
        strokeDashoffset={62.8 - (62.8 * progress) / 100}
        strokeLinecap="round"
      />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-[10px] font-bold text-primary leading-none">{daysLeft}</span>
    </div>
  </div>
);

// ─── Trial widget ─────────────────────────────────────────────────────────────

const TrialWidget: FC<SidebarWidgetProps & { daysLeft: number; totalDays: number }> = ({
  isCollapsed,
  daysLeft,
  totalDays,
}) => {
  const navigate = useNavigate();
  const progress = Math.max(0, Math.min(100, (daysLeft / Math.max(totalDays, 1)) * 100));

  if (isCollapsed) {
    return (
      <div className="flex justify-center w-full px-0">
        <div
          className="h-10 w-10 flex items-center justify-center rounded-full border border-border bg-surface shadow-sm cursor-pointer hover:bg-surface-hover active:scale-95 transition-colors"
          title={`Prueba: ${daysLeft} días restantes`}
          onClick={() => navigate("/payments/pricing")}
        >
          <CircularProgress daysLeft={daysLeft} progress={progress} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-[160px] rounded-[18px] border border-border bg-surface p-3 shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[9px] font-bold text-fg-muted uppercase">Prueba gratuita</span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-black text-fg">{daysLeft}</span>
          <span className="text-[9px] font-bold text-fg-muted uppercase">días</span>
        </div>
      </div>
      <div className="relative h-1 w-full rounded-full bg-primary/10 overflow-hidden mb-2.5">
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[10px] font-medium text-fg-secondary leading-snug mb-3 line-clamp-2">
        Elige un plan antes de que expire tu prueba.
      </p>
      <button
        onClick={() => navigate("/payments/pricing")}
        className="w-full flex items-center justify-center h-8 rounded-lg bg-primary text-primary-foreground text-[10px] font-black active:scale-95 transition-colors hover:bg-primary-600 px-2"
      >
        Ver planes
      </button>
    </div>
  );
};

// ─── Cancelling widget ────────────────────────────────────────────────────────

const CancellingWidget: FC<SidebarWidgetProps & { cancelDate: string; daysLeft: number }> = ({
  isCollapsed,
  cancelDate,
  daysLeft,
}) => {
  if (isCollapsed) {
    return (
      <div className="flex justify-center w-full px-0">
        <div
          className="h-10 w-10 flex items-center justify-center rounded-full border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 shadow-sm cursor-default"
          title={`Cancela el ${cancelDate} · ${daysLeft}d restantes`}
        >
          <Clock className="h-4 w-4 text-amber-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-[160px] rounded-[18px] border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/[0.08] p-3 overflow-hidden">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Clock className="h-3 w-3 text-amber-500 shrink-0" />
        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">Cancelación programada</span>
      </div>
      <p className="text-[11px] font-semibold text-fg leading-snug mb-0.5">
        Acceso hasta el {cancelDate}
      </p>
      <p className="text-[10px] text-fg-muted leading-snug">
        {daysLeft > 0 ? `${daysLeft}d de acceso restante` : "Acceso terminando pronto"}
      </p>
    </div>
  );
};

// ─── Upgrade widget ───────────────────────────────────────────────────────────

const UpgradeWidget: FC<SidebarWidgetProps> = ({ isCollapsed }) => {
  const navigate = useNavigate();

  if (isCollapsed) {
    return (
      <div className="flex justify-center w-full px-0">
        <div
          className="h-10 w-10 flex items-center justify-center rounded-full bg-primary shadow-lg cursor-pointer active:scale-95 transition-colors overflow-hidden"
          onClick={() => navigate("/payments/pricing")}
          title="Ver planes disponibles"
        >
          <Zap className="h-5 w-5 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-[160px] rounded-[18px] bg-gradient-to-br from-primary via-primary to-secondary shadow-premium p-3 relative overflow-hidden">
      <div className="relative z-10 flex flex-col">
        <h4 className="text-[12px] font-medium text-white leading-tight mb-2">
          Elige tu plan
        </h4>
        <p className="text-[10px] text-white/70 leading-snug mb-3 line-clamp-2">
          Accede a todas las funciones y escala tu negocio.
        </p>
        <button
          onClick={() => navigate("/payments/pricing")}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-1.5 text-[10px] font-bold text-primary active:scale-95 transition-colors"
        >
          <span className="truncate">Ver planes</span>
          <ArrowUpCircle className="h-3 w-3 shrink-0" />
        </button>
      </div>
    </div>
  );
};

// ─── Smart billing widget (auto-selects based on subscription state) ──────────

export const BillingStatusWidget: FC<SidebarWidgetProps> = ({ isCollapsed }) => {
  const { data: subscription, isLoading } = useSubscription();

  const state = useMemo(() => {
    if (!subscription || subscription.status === "none") return { type: "upgrade" } as const;

    const status = subscription.status;
    const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
    const cancelAt = subscription.cancelAt ? new Date(subscription.cancelAt) : null;
    const now = Date.now();

    const daysLeft = (date: Date | null) =>
      date ? Math.max(0, Math.ceil((date.getTime() - now) / 86_400_000)) : 0;

    if (status === "trialing" || status === "trialling") {
      const trialEnd = periodEnd;
      return {
        type: "trial",
        daysLeft: daysLeft(trialEnd),
        totalDays: 14,
      } as const;
    }

    if ((status === "active" || status === "trialing" || status === "trialling") && cancelAt) {
      return {
        type: "cancelling",
        cancelDate: cancelAt.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
        daysLeft: daysLeft(cancelAt),
      } as const;
    }

    if (status === "active") return { type: "active" } as const;

    // past_due, unpaid, paused, cancelled → show upgrade
    return { type: "upgrade" } as const;
  }, [subscription]);

  if (isLoading) return null;

  if (state.type === "trial") {
    return <TrialWidget isCollapsed={isCollapsed} daysLeft={state.daysLeft} totalDays={state.totalDays} />;
  }
  if (state.type === "cancelling") {
    return <CancellingWidget isCollapsed={isCollapsed} cancelDate={state.cancelDate} daysLeft={state.daysLeft} />;
  }
  if (state.type === "upgrade") {
    return <UpgradeWidget isCollapsed={isCollapsed} />;
  }
  // Active + no cancellation → no widget
  return null;
};

// ─── Legacy exports (kept for backward compat) ────────────────────────────────

export const TrialStatusWidget: FC<SidebarWidgetProps> = (props) => <BillingStatusWidget {...props} />;
export const UpgradePremiumWidget: FC<SidebarWidgetProps> = (props) => <UpgradeWidget {...props} />;
