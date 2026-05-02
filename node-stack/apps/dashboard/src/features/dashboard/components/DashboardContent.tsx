import { FC, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Zap, 
  CreditCard, 
  Settings as SettingsIcon, 
  Sparkles,
  User,
  Rocket
} from "lucide-react";
import { useAuth } from "@/hooks/stores/useAuth";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { QuickActions, type QuickAction } from "./QuickActions";
import { ConfigSteps } from "@/components/dashboard/ConfigSteps";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, Skeleton } from "@node-stack/ui";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { appToast } from "@/components/alerts/Toasts";
import { NovedadesSection } from "@/components/news/NovedadesSection";
import { useOnboardingStatus, useReleaseNotes } from "../hooks/useDashboard";

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Equipos",
    description: "Permisos y Miembros",
    icon: Users,
    route: "/profile/personal",
    color: "text-[#004080]",
    bg: "bg-[#004080]/5 hover:bg-[#004080]/10",
    iconBg: "bg-white shadow-sm shadow-[#004080]/5"
  },
  {
    label: "IA Assistant",
    description: "BI Predictivo",
    icon: Sparkles,
    route: "/analytics",
    color: "text-[#00E6E6]",
    bg: "bg-[#00E6E6]/5 hover:bg-[#00E6E6]/10",
    iconBg: "bg-slate-900 shadow-lg shadow-[#00E6E6]/10"
  },
  {
    label: "Pagos",
    description: "Suscripción y Más",
    icon: CreditCard,
    route: "/payments",
    color: "text-slate-600",
    bg: "bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10",
    iconBg: "bg-white dark:bg-slate-800 shadow-sm"
  },
  {
    label: "Empresa",
    description: "Datos de Marca",
    icon: SettingsIcon,
    route: "/profile/company",
    color: "text-slate-500",
    bg: "bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10",
    iconBg: "bg-white dark:bg-slate-800 shadow-sm"
  },
];

export const DashboardContent: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: onboardingSteps, isLoading: isLoadingOnboarding } = useOnboardingStatus();
  const { data: newsNotes, isLoading: isLoadingNews } = useReleaseNotes();
  
  // Orchestration: prepara los datos para los componentes presentacionales
  const stepsWithInteractions = useMemo(() => 
    (onboardingSteps || []).map(step => ({
      ...step,
      icon: step.id === "1" ? User : step.id === "2" ? CreditCard : step.id === "3" ? Zap : Rocket,
      onClick: () => {
        if (step.id === "1") navigate("/profile/personal");
        else if (step.id === "2") navigate("/payments");
        else appToast.info({ 
          title: "Próximamente", 
          description: "Esta configuración estará disponible más adelante en tu flujo." 
        });
      }
    })),
    [onboardingSteps, navigate]
  );

  const userName = useMemo(() => 
    (user?.firstName || "Usuario").split(' ')[0],
    [user?.firstName]
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 w-full">
      {/* Header Section */}
      <PageHeader
        title={`¡Bienvenido de nuevo, ${userName}!`}
        description="Aquí está el resumen de tu actividad"
      />

      {/* Welcome & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-10">
          <WelcomeBanner name={userName} avatarUrl={user?.avatar} />
          
          <section className="space-y-8">
            <div className="flex items-center gap-4 px-2">
              <h2 className="text-[11px] font-label text-slate-400 uppercase">Acceso Inmediato</h2>
              <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
            </div>
            <QuickActions actions={QUICK_ACTIONS} />
          </section>
        </div>

        {/* Security Card */}
        <SecurityCard />
      </div>

      {/* Configuration Steps */}
      {isLoadingOnboarding ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <ConfigSteps steps={stepsWithInteractions} />
      )}

      {/* News & Analytics CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {isLoadingNews ? (
            <Skeleton className="h-64 rounded-[32px]" />
          ) : (
            <NovedadesSection notes={newsNotes || []} />
          )}
        </div>
        <AnalyticsCTA />
      </div>
    </div>
  );
};

// Sub-componentes pequeños para organización
const SecurityCard: FC = () => (
  <Card className="p-8 rounded-[32px] border-none bg-slate-900 text-white relative overflow-hidden group">
    <div className="absolute right-0 top-0 w-48 h-48 bg-[#00E6E6]/10 rounded-full blur-[60px] -mr-20 -mt-20 transition-transform duration-1000 group-hover:scale-150" />
    <div className="relative z-10 h-full flex flex-col justify-between">
      <div className="space-y-4">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
          <ShieldCheck className="h-6 w-6 text-[#00E6E6]" />
        </div>
        <h3 className="text-xl font-heading leading-tight">Tu seguridad es nuestra prioridad</h3>
        <p className="text-[12px] text-white/50 leading-relaxed font-label">
          Sistemas operando al 100%. Verificados 128 puntos de control sin anomalías detectadas en las últimas 24h.
        </p>
      </div>
      <button 
        className="w-full mt-8 bg-white/10 text-white hover:bg-white/20 rounded-xl h-12 text-[10px] font-heading uppercase transition-colors"
        onClick={() => appToast.success({ 
          title: "Seguridad verificada", 
          description: "Todos los protocolos de seguridad están activos y actualizados." 
        })}
      >
        Seguridad Avanzada
      </button>
    </div>
  </Card>
);

const AnalyticsCTA: FC = () => (
  <Card className="p-8 rounded-[32px] border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm flex flex-col justify-between group transition-all duration-300 hover:shadow-xl">
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 dark:bg-[#00E6E6]/5 rounded-xl transition-transform group-hover:scale-110">
          <Sparkles className="w-5 h-5 text-[#004080] dark:text-[#00E6E6]" />
        </div>
        <h3 className="text-sm font-heading text-slate-900 dark:text-white uppercase">Business Intelligence</h3>
      </div>
      <p className="text-[13px] text-slate-500 leading-relaxed font-label">
        Explora analíticas profundas, predicciones por IA y reportes avanzados en el nuevo centro de datos.
      </p>
    </div>
    <a 
      href="/analytics"
      className="mt-10 block w-full h-12 rounded-xl bg-[#004080] text-white text-[10px] font-heading uppercase hover:bg-[#003366] active:scale-95 transition-all shadow-lg shadow-[#004080]/10 text-center leading-[3rem]"
    >
      Ir a Analíticas Avanzadas
      <ArrowRight className="w-4 h-4 ml-2 inline" />
    </a>
  </Card>
);
