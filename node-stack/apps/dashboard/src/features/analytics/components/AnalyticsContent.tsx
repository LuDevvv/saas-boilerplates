import { FC, useState, useMemo } from "react";
import { Download, Eye, Users, MousePointer2, Target } from "lucide-react";
import { cn } from "@/utils/classNames";
import { KpiCard } from "./KpiCard";
import { SalesChart, type TrendPoint } from "./SalesChart";
import { ActivityChart, type BarPoint } from "./ActivityChart";
import { DonutWidget, type DonutSlice } from "./DonutWidget";
import { TopProductsTable, type SourceItem } from "./TopProductsTable";
import { appToast } from "@/components/alerts/Toasts";

// ─── Period type ──────────────────────────────────────────────────────────────

type Period = "7D" | "30D" | "3M" | "1A";
const PERIODS: Period[] = ["7D", "30D", "3M", "1A"];

// ─── Mock data — replace with api.analytics.* calls in production ─────────────

const TREND_7D: TrendPoint[] = [
  { label: "Lun", visitas: 1142, sesiones: 2315 },
  { label: "Mar", visitas: 1498, sesiones: 3012 },
  { label: "Mié", visitas: 1267, sesiones: 2580 },
  { label: "Jue", visitas: 1531, sesiones: 3090 },
  { label: "Vie", visitas: 1404, sesiones: 2845 },
  { label: "Sáb", visitas: 698,  sesiones: 1420 },
  { label: "Dom", visitas: 812,  sesiones: 1645 },
];

const TREND_30D: TrendPoint[] = [
  { label: "1",  visitas: 980,  sesiones: 1950 }, { label: "3",  visitas: 1120, sesiones: 2240 },
  { label: "5",  visitas: 1340, sesiones: 2680 }, { label: "7",  visitas: 1180, sesiones: 2360 },
  { label: "9",  visitas: 1420, sesiones: 2840 }, { label: "11", visitas: 1560, sesiones: 3120 },
  { label: "13", visitas: 1390, sesiones: 2780 }, { label: "15", visitas: 1670, sesiones: 3340 },
  { label: "17", visitas: 1450, sesiones: 2900 }, { label: "19", visitas: 1720, sesiones: 3440 },
  { label: "21", visitas: 1590, sesiones: 3180 }, { label: "23", visitas: 1840, sesiones: 3680 },
  { label: "25", visitas: 1630, sesiones: 3260 }, { label: "27", visitas: 1780, sesiones: 3560 },
  { label: "30", visitas: 1920, sesiones: 3840 },
];

const TREND_3M: TrendPoint[] = [
  { label: "Sem 1",  visitas: 5240,  sesiones: 10480 },
  { label: "Sem 3",  visitas: 6180,  sesiones: 12360 },
  { label: "Sem 5",  visitas: 7420,  sesiones: 14840 },
  { label: "Sem 7",  visitas: 6890,  sesiones: 13780 },
  { label: "Sem 9",  visitas: 8340,  sesiones: 16680 },
  { label: "Sem 11", visitas: 9120,  sesiones: 18240 },
  { label: "Sem 13", visitas: 8650,  sesiones: 17300 },
];

const TREND_1A: TrendPoint[] = [
  { label: "Ene", visitas: 18200, sesiones: 36400 },
  { label: "Feb", visitas: 21400, sesiones: 42800 },
  { label: "Mar", visitas: 24800, sesiones: 49600 },
  { label: "Abr", visitas: 28200, sesiones: 56400 },
  { label: "May", visitas: 31600, sesiones: 63200 },
  { label: "Jun", visitas: 29800, sesiones: 59600 },
  { label: "Jul", visitas: 33400, sesiones: 66800 },
  { label: "Ago", visitas: 37200, sesiones: 74400 },
  { label: "Sep", visitas: 41800, sesiones: 83600 },
  { label: "Oct", visitas: 38600, sesiones: 77200 },
  { label: "Nov", visitas: 44200, sesiones: 88400 },
  { label: "Dic", visitas: 48600, sesiones: 97200 },
];

const BAR_7D: BarPoint[] = [
  { label: "Lun", actual: 142, anterior: 118 },
  { label: "Mar", actual: 198, anterior: 167 },
  { label: "Mié", actual: 167, anterior: 189 },
  { label: "Jue", actual: 231, anterior: 195 },
  { label: "Vie", actual: 204, anterior: 213 },
  { label: "Sáb", actual: 98,  anterior: 89 },
  { label: "Dom", actual: 112, anterior: 104 },
];

const BAR_30D: BarPoint[] = [
  { label: "Sem 1", actual: 1248, anterior: 1021 },
  { label: "Sem 2", actual: 1490, anterior: 1284 },
  { label: "Sem 3", actual: 1380, anterior: 1450 },
  { label: "Sem 4", actual: 1612, anterior: 1390 },
];

const BAR_3M: BarPoint[] = [
  { label: "Ene", actual: 4820, anterior: 3940 },
  { label: "Feb", actual: 5640, anterior: 4820 },
  { label: "Mar", actual: 6290, anterior: 5640 },
];

const BAR_1A: BarPoint[] = [
  { label: "T1", actual: 18200, anterior: 14200 },
  { label: "T2", actual: 24600, anterior: 19400 },
  { label: "T3", actual: 31400, anterior: 24200 },
  { label: "T4", actual: 42400, anterior: 31400 },
];

const TRAFFIC_SOURCES: DonutSlice[] = [
  { name: "Búsqueda orgánica", value: 45, color: "#004080" },
  { name: "Referidos",         value: 25, color: "#4D94DB" },
  { name: "Redes sociales",    value: 20, color: "#10B981" },
  { name: "Directo",           value: 10, color: "#F59E0B" },
];

const TOP_CHANNELS: SourceItem[] = [
  { name: "Google",    visits: 2212, change: 2.5,  color: "#4D94DB", percentage: 44 },
  { name: "Facebook",  visits: 1890, change: -1.2, color: "#1877F2", percentage: 38 },
  { name: "Instagram", visits: 1456, change: 5.3,  color: "#E1306C", percentage: 29 },
  { name: "X (Twitter)", visits: 876,  change: 1.1, color: "#1DA1F2", percentage: 18 },
  { name: "Directo",   visits: 723,  change: 0.4,  color: "#10B981", percentage: 14 },
];

const KPI_CONFIG: Record<Period, {
  visits: { value: string; change: number };
  users:  { value: string; change: number };
  bounce: { value: string; change: number };
  conv:   { value: string; change: number };
  bar:    { value: string; change: number };
}> = {
  "7D":  { visits: { value: "8,420",   change: 12.4 }, users: { value: "1,248",  change: 8.7  }, bounce: { value: "42.3%", change: -2.1 }, conv: { value: "4.2%", change: 0.8  }, bar: { value: "952",   change: 8.4  } },
  "30D": { visits: { value: "35,420",  change: 9.2  }, users: { value: "3,651",  change: 12.4 }, bounce: { value: "41.8%", change: -3.2 }, conv: { value: "3.8%", change: 1.2  }, bar: { value: "5,730", change: 9.2  } },
  "3M":  { visits: { value: "102,840", change: 18.4 }, users: { value: "9,842",  change: 22.1 }, bounce: { value: "39.4%", change: -5.8 }, conv: { value: "4.6%", change: 2.1  }, bar: { value: "16,750", change: 18.1 } },
  "1A":  { visits: { value: "428,250", change: 31.2 }, users: { value: "38,450", change: 28.9 }, bounce: { value: "38.2%", change: -8.4 }, conv: { value: "5.1%", change: 3.4  }, bar: { value: "65,200", change: 31.5 } },
};

const SPARKLINES: Record<string, number[]> = {
  visits: [42, 55, 48, 73, 52, 89, 97, 84, 110, 128],
  users:  [12, 18, 15, 22, 19, 28, 31, 25, 34, 40],
  bounce: [45, 43, 48, 42, 41, 43, 44, 42, 40, 39],
  conv:   [3.8, 4.1, 3.9, 4.0, 4.3, 4.1, 4.2, 4.4, 4.3, 4.5],
};

const TREND_MAP: Record<Period, TrendPoint[]> = {
  "7D": TREND_7D, "30D": TREND_30D, "3M": TREND_3M, "1A": TREND_1A,
};

const BAR_MAP: Record<Period, BarPoint[]> = {
  "7D": BAR_7D, "30D": BAR_30D, "3M": BAR_3M, "1A": BAR_1A,
};

// ─── Period selector ──────────────────────────────────────────────────────────

const PeriodSelector: FC<{ period: Period; onChange: (p: Period) => void }> = ({ period, onChange }) => (
  <div className="flex items-center gap-0.5 bg-surface-hover rounded-[10px] p-0.5">
    {PERIODS.map(p => (
      <button
        key={p}
        onClick={() => onChange(p)}
        className={cn(
          "px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all duration-200",
          period === p
            ? "bg-white dark:bg-white/15 text-fg shadow-sm"
            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        )}
      >
        {p}
      </button>
    ))}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const AnalyticsContent: FC = () => {
  const [period, setPeriod] = useState<Period>("30D");
  const kpi = KPI_CONFIG[period];

  const kpis = useMemo(() => [
    {
      label: "Vistas de página",
      value: kpi.visits.value,
      change: kpi.visits.change,
      icon: Eye,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      sparkline: SPARKLINES.visits,
      color: "#004080",
    },
    {
      label: "Usuarios únicos",
      value: kpi.users.value,
      change: kpi.users.change,
      icon: Users,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      sparkline: SPARKLINES.users,
      color: "#4D94DB",
    },
    {
      label: "Tasa de rebote",
      value: kpi.bounce.value,
      change: kpi.bounce.change,
      icon: MousePointer2,
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      sparkline: SPARKLINES.bounce,
      color: "#F59E0B",
      invertTrend: true,
    },
    {
      label: "Conversión",
      value: kpi.conv.value,
      change: kpi.conv.change,
      icon: Target,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      sparkline: SPARKLINES.conv,
      color: "#10B981",
    },
  ], [kpi]);

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase text-fg-muted mb-1">Panel</p>
          <h1 className="text-xl sm:text-2xl font-heading text-fg leading-tight">
            Analíticas
          </h1>
          <p className="text-[13px] text-fg-muted mt-0.5">
            Monitorea el rendimiento de tu plataforma en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start">
          <PeriodSelector period={period} onChange={setPeriod} />
          {/* Icon-only on mobile, full label on sm+ */}
          <button
            onClick={() => appToast.info({ title: "Exportando", description: "Tu reporte se está generando." })}
            className="h-9 w-9 sm:w-auto sm:px-4 rounded-xl border border-border flex items-center justify-center gap-2 text-[12px] font-medium text-gray-600 dark:text-gray-300 hover:bg-surface-hover transition-all active:scale-95"
          >
            <Download className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <KpiCard key={kpi.label} period="vs período anterior" {...kpi} />
        ))}
      </div>

      {/* ── Trend chart + Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart
            data={TREND_MAP[period]}
            period={period}
            onPeriodChange={setPeriod}
          />
        </div>
        <DonutWidget
          title="Fuentes de tráfico"
          data={TRAFFIC_SOURCES}
          centerLabel="Tráfico"
        />
      </div>

      {/* ── Bar chart + Top channels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart
          title="Actividad del período"
          value={kpi.bar.value}
          change={kpi.bar.change}
          data={BAR_MAP[period]}
        />
        <TopProductsTable
          title="Principales canales"
          sources={TOP_CHANNELS}
        />
      </div>
    </div>
  );
};
