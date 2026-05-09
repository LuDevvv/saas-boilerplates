import { FC, useState } from "react";
import {
  Users, Building2, CreditCard, Cpu, Brain, HardDrive,
  Ticket, Activity, TrendingUp, RefreshCw,
  UserCheck, Shield, Crown, Wifi,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@node-stack/ui";
import { useAdminStats, useAdminTrends } from "../../hooks";
import { KpiCard } from "./KpiCard";
import { SectionCard } from "./SectionCard";
import { StatusBreakdown } from "./StatusBreakdown";
import { SystemHealth } from "./SystemHealth";
import { AreaTrendChart, AiBarChart } from "./TrendChart";
import { cn } from "@/utils/classNames";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtBytes = (b: number) =>
  b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : b >= 1e6 ? `${(b / 1e6).toFixed(0)} MB` : `${(b / 1e3).toFixed(0)} KB`;

const fmtTokens = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);

const DAYS_OPTIONS = [7, 14, 30, 90] as const;
type Days = (typeof DAYS_OPTIONS)[number];

// ─── Main ─────────────────────────────────────────────────────────────────────

export const ControlCenterContent: FC = () => {
  const [days, setDays] = useState<Days>(30);
  const { data: stats, isLoading: statsLoading, refetch, isFetching } = useAdminStats();
  const { data: trends, isLoading: trendsLoading } = useAdminTrends(days);

  const totalTickets = stats?.tickets.total ?? 0;
  const totalTasks = stats?.tasks.total ?? 0;

  return (
    <div className="pb-20 animate-in fade-in duration-500 space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <PageHeader
        eyebrow="ADMIN"
        title="Centro de Control"
        description="Vista unificada del estado de la plataforma — usuarios, actividad, recursos y sistema."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-9 w-9 rounded-xl border border-border bg-surface text-fg-muted hover:bg-surface-hover hover:text-fg transition-colors flex items-center justify-center disabled:opacity-50"
              title="Actualizar datos"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </button>
            <Link
              to="/admin/users"
              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <Users className="h-3.5 w-3.5" />
              Gestionar usuarios
            </Link>
          </div>
        }
      />

      {/* ── KPI Strip ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Usuarios totales"
          value={stats?.users.total.toLocaleString() ?? "—"}
          sub={`+${stats?.users.newThisWeek ?? 0} esta semana`}
          icon={Users}
          color="text-primary bg-primary/10"
          trend={stats && stats.users.newThisWeek > 0 ? "up" : "neutral"}
          trendLabel={stats ? `+${stats.users.newThisMonth}` : undefined}
          loading={statsLoading}
        />
        <KpiCard
          label="Sesiones activas"
          value={stats?.users.activeSessions.toLocaleString() ?? "—"}
          sub={`DAU: ${stats?.users.dau ?? 0} usuarios`}
          icon={Wifi}
          color="text-emerald-600 bg-emerald-500/10"
          trend={stats && stats.users.dau > 0 ? "up" : "neutral"}
          trendLabel={stats ? `${stats.users.dau} hoy` : undefined}
          loading={statsLoading}
        />
        <KpiCard
          label="Workspaces"
          value={stats?.workspaces.total.toLocaleString() ?? "—"}
          sub={`+${stats?.workspaces.newThisMonth ?? 0} este mes`}
          icon={Building2}
          color="text-violet-600 bg-violet-500/10"
          trend={stats && stats.workspaces.newThisMonth > 0 ? "up" : "neutral"}
          trendLabel={stats ? `+${stats.workspaces.newThisMonth}` : undefined}
          loading={statsLoading}
        />
        <KpiCard
          label="Suscripciones activas"
          value={stats?.subscriptions.active.toLocaleString() ?? "—"}
          sub={`Tokens IA 30d: ${stats ? fmtTokens(stats.ai.totalTokens30d) : "—"}`}
          icon={CreditCard}
          color="text-amber-600 bg-amber-500/10"
          loading={statsLoading}
        />
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* User growth */}
        <SectionCard
          title="Crecimiento de usuarios"
          subtitle={`Nuevos registros — últimos ${days} días`}
          icon={TrendingUp}
          iconColor="text-primary bg-primary/10"
          action={
            <div className="flex items-center gap-1">
              {DAYS_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={cn(
                    "h-6 px-2.5 rounded-lg text-[10px] font-semibold transition-all",
                    days === d
                      ? "bg-primary text-primary-foreground"
                      : "text-fg-muted hover:text-fg hover:bg-surface-hover"
                  )}
                >
                  {d}d
                </button>
              ))}
            </div>
          }
        >
          <div className="h-[200px]">
            <AreaTrendChart
              data={trends?.userGrowth}
              loading={trendsLoading}
              dataKey="count"
              valueLabel="Registros"
            />
          </div>
        </SectionCard>

        {/* AI usage */}
        <SectionCard
          title="Uso de IA"
          subtitle={`Tokens consumidos — últimos ${days} días`}
          icon={Brain}
          iconColor="text-violet-600 bg-violet-500/10"
        >
          <div className="h-[200px]">
            <AiBarChart data={trends?.aiTrend} loading={trendsLoading} />
          </div>
        </SectionCard>
      </div>

      {/* ── Activity trend (full width) ──────────────────────────────────────── */}
      <SectionCard
        title="Actividad de la plataforma"
        subtitle={`Eventos auditados (todas las acciones) — últimos ${days} días`}
        icon={Activity}
        iconColor="text-emerald-600 bg-emerald-500/10"
      >
        <div className="h-[160px]">
          <AreaTrendChart
            data={trends?.activityTrend}
            loading={trendsLoading}
            dataKey="count"
            valueLabel="Eventos"
            color="rgb(16 185 129)"
          />
        </div>
      </SectionCard>

      {/* ── Breakdown grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* Users by status */}
        <SectionCard
          title="Estado de usuarios"
          icon={UserCheck}
          iconColor="text-primary bg-primary/10"
          action={<Link to="/admin/users" className="text-[11px] text-primary hover:underline">Ver todos →</Link>}
        >
          <StatusBreakdown
            loading={statsLoading}
            items={[
              { label: "Activos", value: stats?.users.byStatus["active"] ?? 0, color: "bg-emerald-500" },
              { label: "Suspendidos", value: stats?.users.byStatus["suspended"] ?? 0, color: "bg-amber-500" },
              { label: "Baneados", value: stats?.users.byStatus["banned"] ?? 0, color: "bg-red-500" },
            ]}
            total={stats?.users.total}
          />
          <div className="mt-4 pt-4 border-t border-border-subtle grid grid-cols-3 gap-2">
            {[
              { icon: Users, label: "Usuarios", count: stats?.users.byRole["user"] ?? 0, color: "text-fg-muted" },
              { icon: Shield, label: "Admins", count: stats?.users.byRole["admin"] ?? 0, color: "text-primary" },
              { icon: Crown, label: "Superadmin", count: stats?.users.byRole["super_admin"] ?? 0, color: "text-amber-500" },
            ].map(({ icon: Icon, label, count, color }) => (
              <div key={label} className="text-center">
                <Icon className={cn("h-4 w-4 mx-auto mb-1", color)} />
                <p className="text-[18px] font-heading text-fg">{count}</p>
                <p className="text-[10px] text-fg-muted">{label}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Subscriptions */}
        <SectionCard
          title="Subscripciones"
          icon={CreditCard}
          iconColor="text-amber-600 bg-amber-500/10"
          action={<Link to="/admin/workspaces" className="text-[11px] text-primary hover:underline">Ver workspaces →</Link>}
        >
          <StatusBreakdown
            loading={statsLoading}
            items={[
              { label: "Activas", value: stats?.subscriptions.byStatus["active"] ?? 0, color: "bg-emerald-500" },
              { label: "Trial", value: stats?.subscriptions.byStatus["trialling"] ?? 0, color: "bg-primary" },
              { label: "Past due", value: stats?.subscriptions.byStatus["past_due"] ?? 0, color: "bg-amber-500" },
              { label: "Canceladas", value: stats?.subscriptions.byStatus["cancelled"] ?? 0, color: "bg-fg-muted" },
            ]}
          />
          <div className="mt-4 pt-4 border-t border-border-subtle grid grid-cols-3 gap-2">
            {[
              { label: "Free", count: stats?.workspaces.byTier["free"] ?? 0, color: "text-fg-muted" },
              { label: "Pro", count: stats?.workspaces.byTier["pro"] ?? 0, color: "text-primary" },
              { label: "Enterprise", count: stats?.workspaces.byTier["enterprise"] ?? 0, color: "text-amber-500" },
            ].map(({ label, count, color }) => (
              <div key={label} className="text-center">
                <p className={cn("text-[18px] font-heading", color)}>{count}</p>
                <p className="text-[10px] text-fg-muted">{label}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Tickets & Tasks */}
        <SectionCard
          title="Tickets y Tareas"
          icon={Ticket}
          iconColor="text-rose-600 bg-rose-500/10"
        >
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted mb-2">Tickets ({totalTickets})</p>
              <StatusBreakdown
                loading={statsLoading}
                items={[
                  { label: "Pendientes", value: stats?.tickets.byStatus["pending"] ?? 0, color: "bg-amber-500" },
                  { label: "Activos", value: stats?.tickets.byStatus["active"] ?? 0, color: "bg-primary" },
                  { label: "Cerrados", value: stats?.tickets.byStatus["inactive"] ?? 0, color: "bg-fg-muted" },
                ]}
                total={totalTickets}
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted mb-2">
                Tareas ({totalTasks}) · {stats?.tasks.completedThisWeek ?? 0} completadas esta semana
              </p>
              <StatusBreakdown
                loading={statsLoading}
                items={[
                  { label: "Por hacer", value: stats?.tasks.byStatus["todo"] ?? 0, color: "bg-fg-muted" },
                  { label: "En curso", value: stats?.tasks.byStatus["in_progress"] ?? 0, color: "bg-primary" },
                  { label: "Listas", value: stats?.tasks.byStatus["done"] ?? 0, color: "bg-emerald-500" },
                  { label: "Canceladas", value: stats?.tasks.byStatus["cancelled"] ?? 0, color: "bg-red-400" },
                ]}
                total={totalTasks}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Bottom row: AI model breakdown + Storage + System ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* AI by model */}
        <SectionCard
          title="IA por modelo"
          subtitle="Total de tokens por proveedor"
          icon={Brain}
          iconColor="text-violet-600 bg-violet-500/10"
        >
          {statsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 rounded-lg bg-surface-muted animate-pulse" />
              ))}
            </div>
          ) : !stats?.ai.byModel.length ? (
            <p className="text-[12px] text-fg-muted text-center py-4">Sin datos de IA</p>
          ) : (
            <div className="space-y-2.5">
              {stats.ai.byModel.slice(0, 6).map((m) => (
                <div key={`${m.provider}-${m.model}`} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[12px] font-mono text-fg truncate">{m.model}</p>
                    <p className="text-[10px] text-fg-muted capitalize">{m.provider}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-fg-secondary tabular-nums shrink-0">
                    {fmtTokens(m.totalTokens)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Storage */}
        <SectionCard
          title="Almacenamiento"
          subtitle="Uso global de archivos"
          icon={HardDrive}
          iconColor="text-teal-600 bg-teal-500/10"
        >
          {statsLoading ? (
            <div className="space-y-3">
              <div className="h-12 rounded-lg bg-surface-muted animate-pulse" />
              <div className="h-3 rounded-full bg-surface-muted animate-pulse" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-2">
                <p className="text-[36px] font-heading text-fg leading-none">
                  {stats ? fmtBytes(stats.storage.totalBytes) : "—"}
                </p>
                <p className="text-[12px] text-fg-muted mt-1">
                  {stats?.storage.fileCount.toLocaleString() ?? 0} archivos activos
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-subtle">
                <div className="text-center">
                  <p className="text-[18px] font-heading text-fg">{stats?.storage.fileCount.toLocaleString() ?? 0}</p>
                  <p className="text-[10px] text-fg-muted">Archivos</p>
                </div>
                <div className="text-center">
                  <p className="text-[18px] font-heading text-fg">
                    {stats && stats.storage.fileCount > 0
                      ? fmtBytes(stats.storage.totalBytes / stats.storage.fileCount)
                      : "—"}
                  </p>
                  <p className="text-[10px] text-fg-muted">Promedio</p>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* System health */}
        <SectionCard
          title="Salud del sistema"
          subtitle="Estado del proceso API"
          icon={Cpu}
          iconColor="text-slate-600 bg-slate-500/10"
        >
          <SystemHealth system={stats?.system} loading={statsLoading} />
        </SectionCard>
      </div>
    </div>
  );
};
