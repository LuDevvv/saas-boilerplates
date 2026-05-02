import { FC, useState, useMemo } from "react";
import { Card, Button, Skeleton } from "@node-stack/ui";
import { appToast } from "@/components/alerts/Toasts";
import {
  Eye,
  Users,
  MousePointer2,
  Target,
  AlertCircle,
} from "lucide-react";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { KpiGrid } from "./KpiGrid";
import { SalesChart } from "./SalesChart";
import { ActivityChart } from "./ActivityChart";
import { TopProductsTable } from "./TopProductsTable";
import { TimeFilter } from "./TimeFilter";
import { ReportButton } from "./ReportButton";
import type { TimeFilter as TimeFilterType } from "../types";
import { useAnalyticsOverview, useAnalyticsTraffic, useAnalyticsPages } from "../hooks/useAnalytics";
import { useWorkspaceStore } from "@/stores/workspaceStore";

export const AnalyticsContent: FC = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>("month");
  const { activeWorkspaceId } = useWorkspaceStore();

  const { 
    data: overview, 
    isLoading: isLoadingOverview, 
    error: overviewError 
  } = useAnalyticsOverview(activeWorkspaceId || "");

  const { 
    data: traffic, 
    isLoading: isLoadingTraffic 
  } = useAnalyticsTraffic(activeWorkspaceId || "");

  const { 
    data: pages, 
    isLoading: isLoadingPages 
  } = useAnalyticsPages(activeWorkspaceId || "");

  const kpiData = useMemo(() => {
    if (!overview) return [];
    return [
      { 
        label: "Vistas de Página", 
        value: overview.totalVisits.value.toLocaleString(), 
        trend: `${overview.totalVisits.change > 0 ? "+" : ""}${overview.totalVisits.change}%`, 
        isPositive: overview.totalVisits.trend === "up", 
        icon: Eye, 
        tooltip: "Total de pantallas visualizadas" 
      },
      { 
        label: "Usuarios Únicos", 
        value: overview.activeSessions.value.toLocaleString(), 
        trend: `${overview.activeSessions.change > 0 ? "+" : ""}${overview.activeSessions.change}%`, 
        isPositive: overview.activeSessions.trend === "up", 
        icon: Users, 
        tooltip: "Visitantes únicos este mes" 
      },
      { 
        label: "Tasa de Rebote", 
        value: `${overview.bounceRate.value}%`, 
        trend: `${overview.bounceRate.change > 0 ? "+" : ""}${overview.bounceRate.change}%`, 
        isPositive: overview.bounceRate.trend === "down", // bounce rate down is positive
        icon: MousePointer2, 
        tooltip: "Porcentaje de abandono inmediato" 
      },
      { 
        label: "Conversión", 
        value: "3.8%", 
        trend: "+ 1.2%", 
        isPositive: true, 
        icon: Target, 
        tooltip: "Objetivos clave completados" 
      },
    ];
  }, [overview]);

  const activityData = useMemo(() => {
    if (!traffic) return [];
    return traffic.map(t => ({ day: t.date, value: t.count }));
  }, [traffic]);

  const salesData = useMemo(() => {
    if (!traffic) return [];
    return traffic.map(t => ({ 
      date: t.date, 
      current: t.count * 10, // Mocked scaling
      last: t.count * 8      // Mocked last period
    }));
  }, [traffic]);

  const bestSellers = useMemo(() => {
    if (!pages) return [];
    return pages.map((p, i) => ({
      id: `#${1000 + i}`,
      name: p.path,
      sold: p.views,
      revenue: p.growth,
      rating: "4.8",
      image: "📄"
    }));
  }, [pages]);

  const repeatCustomerRate = 68;

  if (overviewError) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-heading text-slate-900 dark:text-white">Error al cargar analíticas</h2>
        <p className="text-slate-500">No pudimos conectar con el servicio de datos.</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 animate-in fade-in duration-700">
      <SectionHeader
        title="Analíticas Avanzadas"
        subtitle="Monitorea el rendimiento de tu negocio en tiempo real."
        className="mb-10"
        action={
          <div className="flex items-center gap-3">
            <TimeFilter value={timeFilter} onChange={setTimeFilter} />
            <ReportButton />
          </div>
        }
      />

      {isLoadingOverview ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-[24px]" />)}
        </div>
      ) : (
        <KpiGrid kpis={kpiData} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {isLoadingTraffic ? (
          <Skeleton className="h-[400px] lg:col-span-2 rounded-[32px]" />
        ) : (
          <SalesChart data={salesData} />
        )}
        {isLoadingTraffic ? (
          <Skeleton className="h-[400px] rounded-[32px]" />
        ) : (
          <ActivityChart data={activityData} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isLoadingPages ? (
          <Skeleton className="h-[500px] lg:col-span-2 rounded-[32px]" />
        ) : (
          <TopProductsTable products={bestSellers} />
        )}

        <div className="space-y-8">
          <Card className="p-8 rounded-[32px] border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm text-center">
            <h3 className="text-sm font-heading text-slate-900 dark:text-white uppercase mb-8">Tasa de Retención</h3>
            <div className="relative w-40 h-20 mx-auto overflow-hidden mb-6">
              <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-[12px] border-slate-50 dark:border-white/5" />
              <div
                className="absolute top-0 left-0 w-40 h-40 rounded-full border-[12px] border-[#00E6E6] border-b-transparent border-l-transparent transition-transform duration-1000"
                style={{ transform: `rotate(${(repeatCustomerRate / 100) * 180 - 45}deg)` }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                <span className="text-4xl font-kpi text-slate-900 dark:text-white">{repeatCustomerRate}%</span>
              </div>
            </div>
            <p className="text-[10px] font-label text-slate-400 uppercase mb-6">Objetivo del Trimestre: 85%</p>
            <Button
              className="w-full rounded-xl bg-primary hover:bg-primary-600 text-white font-heading uppercase text-[10px] h-10 active:scale-95 transition-all shadow-md shadow-blue-900/10"
              onClick={() => appToast.success({ title: "Análisis iniciado", description: "Se está ejecutando un modelo de segmentación avanzado en segundo plano." })}
            >
              Analizar Segmentos
            </Button>
          </Card>

          <Card className="p-8 rounded-[32px] border-none bg-primary dark:bg-primary/20 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            <h4 className="text-sm font-heading uppercase mb-2 relative z-10">Optimización AI</h4>
            <p className="text-[11px] text-white/70 leading-relaxed mb-6 relative z-10">
              Nuestro motor de inteligencia artificial ha detectado una oportunidad de crecimiento del 15% optimizando el funnel de checkout.
            </p>
            <Button
              variant="ghost"
              className="w-full rounded-xl bg-white/10 text-white hover:bg-white/20 text-[10px] font-heading uppercase relative z-10"
              onClick={() => appToast.success({ title: "Optimización aplicada", description: "Se han aplicado los cambios recomendados por la IA en tu embudo." })}
            >
              Aplicar Sugerencia
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};