import { FC } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
// ─── Shared tooltip ──────────────────────────────────────────────────────────

const CustomTooltip: FC<any> = ({ active, payload, label, valueLabel, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[12px] border border-border bg-surface-elevated shadow-[var(--shadow-elevated)] px-3 py-2.5 text-[12px]">
      <p className="text-fg-muted mb-1 font-semibold">
        {label ? (() => { try { return format(parseISO(label), "d MMM yyyy", { locale: es }); } catch { return label; } })() : ""}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-fg">
          <span className="text-fg-muted">{valueLabel ?? p.name}: </span>
          <span className="font-semibold">{formatter ? formatter(p.value) : p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

// ─── User growth area chart ───────────────────────────────────────────────────

interface GrowthChartProps {
  data?: Array<{ date: string; count: number }>;
  loading?: boolean;
  color?: string;
  dataKey?: string;
  valueLabel?: string;
  formatter?: (v: number) => string;
}

export const AreaTrendChart: FC<GrowthChartProps> = ({
  data = [], loading, color = "var(--color-primary, #3B82F6)",
  dataKey = "count", valueLabel, formatter,
}) => {
  if (loading) {
    return <div className="h-full w-full rounded-[12px] bg-surface-muted animate-pulse" />;
  }
  if (!data.length) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-[12px] text-fg-muted">Sin datos disponibles</p>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.18} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--text-fg-muted, #6b7280)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => {
            try { return format(parseISO(v), "d MMM", { locale: es }); } catch { return v; }
          }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 10, fill: "var(--text-fg-muted, #6b7280)" }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip valueLabel={valueLabel} formatter={formatter} />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${dataKey})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ─── AI token bar chart ───────────────────────────────────────────────────────

interface AiBarChartProps {
  data?: Array<{ date: string; tokens: number; calls: number }>;
  loading?: boolean;
}

const fmtTokens = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v);

export const AiBarChart: FC<AiBarChartProps> = ({ data = [], loading }) => {
  if (loading) return <div className="h-full w-full rounded-[12px] bg-surface-muted animate-pulse" />;
  if (!data.length) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-[12px] text-fg-muted">Sin datos de IA disponibles</p>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--text-fg-muted, #6b7280)" }}
          tickLine={false} axisLine={false}
          tickFormatter={(v) => { try { return format(parseISO(v), "d MMM", { locale: es }); } catch { return v; } }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 10, fill: "var(--text-fg-muted, #6b7280)" }} tickLine={false} axisLine={false} tickFormatter={fmtTokens} />
        <Tooltip
          content={<CustomTooltip valueLabel="Tokens" formatter={fmtTokens} />}
          cursor={{ fill: "var(--surface-hover)", radius: 4 }}
        />
        <Bar dataKey="tokens" fill="var(--color-primary, #3B82F6)" radius={[4, 4, 0, 0]} maxBarSize={24} fillOpacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  );
};
