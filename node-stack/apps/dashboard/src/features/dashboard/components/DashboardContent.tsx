import { Skeleton } from "@node-stack/ui";
import {
  Users,
  CreditCard,
  Building2,
  BarChart3,
  User,
  Zap,
  Rocket,
  SlidersHorizontal,
} from "lucide-react";
import { FC, ReactNode, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";




import { DashboardCustomizer } from "./DashboardCustomizer";
import { QuickActions, type QuickAction } from "./QuickActions";
import { TutorialsWidget } from "./TutorialsWidget";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { useOnboardingStatus, useReleaseNotes } from "../hooks/useDashboard";
import { useDashboardLayout, type WidgetId } from "../hooks/useDashboardLayout";

import { appToast } from "@/components/alerts/Toasts";
import { ConfigSteps } from "@/components/dashboard/ConfigSteps";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { NovedadesSection } from "@/components/news/NovedadesSection";
import { KpiCard } from "@/features/analytics/components/KpiCard";
import { useAuth } from "@/hooks/stores/useAuth";
import { cn } from "@/utils/classNames";

// ─── Quick actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Analíticas",
    description: "Métricas y datos",
    icon: BarChart3,
    route: "/analytics",
    headerBg: "bg-primary/[0.06] dark:bg-primary/[0.10]",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    label: "Equipo",
    description: "Miembros y roles",
    icon: Users,
    route: "/settings/members",
    headerBg: "bg-blue-50 dark:bg-blue-500/[0.08]",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Suscripción",
    description: "Plan y pagos",
    icon: CreditCard,
    route: "/payments",
    headerBg: "bg-emerald-50 dark:bg-emerald-500/[0.08]",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Empresa",
    description: "Datos de compañía",
    icon: Building2,
    route: "/profile/company",
    headerBg: "bg-amber-50 dark:bg-amber-500/[0.08]",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
];

// ─── KPI cards (reuse same component as analytics page) ───────────────────────

const DASHBOARD_KPIS = [
  {
    id: "users",
    label: "Usuarios activos",
    value: "1,248",
    change: 12.4,
    icon: Users,
    sparkline: [820, 910, 880, 950, 1100, 1180, 1248],
    color: "#3B82F6",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "revenue",
    label: "Ingresos",
    value: "$8,492",
    change: 7.2,
    icon: CreditCard,
    sparkline: [6200, 6800, 7100, 7400, 7800, 8100, 8492],
    color: "#10B981",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "sessions",
    label: "Sesiones",
    value: "3,651",
    change: -2.1,
    icon: BarChart3,
    sparkline: [4200, 4100, 3900, 3800, 3750, 3680, 3651],
    color: "#F59E0B",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "conversion",
    label: "Conversión",
    value: "4.2%",
    change: 0.8,
    icon: Zap,
    sparkline: [3.2, 3.5, 3.8, 3.9, 4.0, 4.1, 4.2],
    color: "#004080",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
];

// ─── Section label row ────────────────────────────────────────────────────────

const SectionRow: FC<{ label: string; action?: ReactNode }> = ({ label, action }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-[11px] font-bold uppercase text-fg-muted whitespace-nowrap">
        {label}
      </span>
      <div className="h-px flex-1 bg-[var(--border)] min-w-[20px]" />
    </div>
    {action}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const DashboardContent: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const { data: onboardingSteps, isLoading: isLoadingOnboarding } = useOnboardingStatus();
  const { data: newsNotes, isLoading: isLoadingNews } = useReleaseNotes();
  const { visibility, widgetOrder, toggle, setWidgetOrder, resetToDefaults, isVisible } = useDashboardLayout();

  const stepsWithInteractions = useMemo(() =>
    (onboardingSteps || []).map(step => ({
      ...step,
      icon: step.id === "1" ? User
          : step.id === "2" ? CreditCard
          : step.id === "3" ? Zap
          : Rocket,
      actionLabel: "Ir",
      onClick: () => {
        if (step.id === "1") navigate("/profile/personal");
        else if (step.id === "2") navigate("/payments");
        else appToast.info({ title: "Próximamente", description: "Esta configuración estará disponible pronto." });
      },
    })),
    [onboardingSteps, navigate]
  );

  const hasAnyVisible = widgetOrder.some(id => isVisible(id));

  // Skeleton DESPUÉS de todos los hooks (regla de hooks de React)
  if (isLoadingOnboarding && isLoadingNews) return <DashboardSkeleton />;

  // ── Widget renderer ──────────────────────────────────────────────────────────

  const renderWidget = (id: WidgetId): ReactNode => {
    switch (id) {
      case "quick-actions":
        return (
          <div className="space-y-3" key="quick-actions">
            <SectionRow label="Acceso rápido" />
            <QuickActions actions={QUICK_ACTIONS} />
          </div>
        );

      case "stats":
        return (
          <div className="space-y-3" key="stats">
            <SectionRow label="Resumen" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {DASHBOARD_KPIS.map(kpi => (
                <KpiCard key={kpi.id} {...kpi} />
              ))}
            </div>
          </div>
        );

      case "onboarding":
        if (isLoadingOnboarding) return <Skeleton key="onboarding" className="h-[68px] rounded-[20px]" />;
        if (!stepsWithInteractions.length) return null;
        return (
          <div className="space-y-3" key="onboarding">
            <SectionRow label="Configuración inicial" />
            <ConfigSteps
              steps={stepsWithInteractions}
              title="Completa tu cuenta"
              defaultCollapsed={false}
            />
          </div>
        );

      case "novedades":
        if (isLoadingNews) return (
          <div key="novedades" className="space-y-3">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-[180px] rounded-[20px]" />
          </div>
        );
        return (
          <NovedadesSection key="novedades" notes={newsNotes || []} />
        );

      case "guias":
        return (
          <div className="space-y-3" key="guias">
            <SectionRow label="Guías y tutoriales" />
            <TutorialsWidget />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-in fade-in duration-500 w-full space-y-6">

      {/* ── Welcome banner — card with rounded corners ── */}
      <WelcomeBanner
        firstName={user?.firstName || "Usuario"}
        lastName={user?.lastName ?? undefined}
        avatarUrl={user?.avatarUrl}
      />

      {/* ── Page header with personalizar button ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase text-fg-muted">Panel</p>
          <h1 className="text-lg sm:text-xl font-heading text-fg leading-tight">
            Inicio
          </h1>
        </div>
        <button
          onClick={() => setCustomizerOpen(true)}
          className={cn(
            "flex items-center gap-1.5 h-9 px-3 sm:px-4 rounded-[12px] shrink-0",
            "border border-border text-[12px] font-medium",
            "text-fg-secondary",
            "hover:bg-surface-hover hover:border-border-strong",
            "hover:text-gray-900 dark:hover:text-white",
            "transition-all duration-150 active:scale-95"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden xs:inline">Personalizar</span>
        </button>
      </div>

      {/* ── Ordered widgets ── */}
      {hasAnyVisible ? (
        widgetOrder
          .filter(id => isVisible(id))
          .map(id => renderWidget(id))
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-14 w-14 rounded-full bg-surface-hover flex items-center justify-center mb-4">
            <SlidersHorizontal className="h-6 w-6 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-[14px] font-semibold text-fg-secondary">
            Has ocultado todas las secciones.
          </p>
          <button
            onClick={() => setCustomizerOpen(true)}
            className="mt-3 text-[12px] font-medium text-primary hover:text-primary-600 transition-colors"
          >
            Personalizar inicio →
          </button>
        </div>
      )}

      {/* ── Customizer drawer ── */}
      <DashboardCustomizer
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        visibility={visibility}
        widgetOrder={widgetOrder}
        onToggle={toggle}
        onReorder={setWidgetOrder}
        onReset={resetToDefaults}
      />
    </div>
  );
};
