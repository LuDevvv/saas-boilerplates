import { AppShell } from "./AppShell";
import { useWorkspace } from "../../hooks/useWorkspace";
import { useUI } from "../../hooks/useUI";
import { useDashboardMetrics } from "../../hooks/useDashboardMetrics";
import { useI18n } from "../../hooks/useI18n";
import { EmptyState } from "./EmptyState";
import { Card, CardContent, Button } from "@workspace/ui";
import {
  Users,
  ListChecks,
  Activity,
  Zap,
  Eye,
  Banknote,
  Timer,
  Info,
  Filter,
  Share2,
  ChevronDown,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Database,
  Globe,
  Fingerprint,
  ShieldCheck,
  Loader2,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

export function DashboardView() {
  return <DashboardContent />;
}

function MetricCardSkeleton() {
  return (
    <Card className="animate-pulse border-none bg-secondary/50 rounded-3xl">
      <div className="p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-6 w-6 bg-muted rounded-full" />
        </div>
        <div className="h-10 w-24 bg-muted rounded mb-2" />
        <div className="h-4 w-16 bg-muted rounded" />
      </div>
    </Card>
  );
}

function MetricCard({
  icon,
  title,
  value,
  trend,
  trendType = "up",
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: string;
  trendType?: "up" | "down";
}) {
  return (
    <Card className="group relative border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700 overflow-hidden rounded-3xl hover:-translate-y-1">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/50 border border-border/50 flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3 shadow-inner">
              {icon}
            </div>
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              {title}
            </h3>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-foreground tracking-tight underline decoration-primary/10 underline-offset-8 transition-all group-hover:decoration-primary/30">
            {value}
          </span>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-500",
                trendType === "up"
                  ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20 group-hover:bg-emerald-500/10"
                  : "bg-destructive/5 text-destructive border-destructive/20 group-hover:bg-destructive/10",
              )}
            >
              {trend}
              {trendType === "up" ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
            </div>
          )}
        </div>
      </div>
      <div
        className={cn(
          "h-1.5 w-full bg-primary/20 transition-all duration-700 opacity-0 group-hover:opacity-100 absolute bottom-0",
          trendType === "down" && "bg-destructive/20",
        )}
      />
    </Card>
  );
}

function DashboardContent() {
  const { activeWorkspace } = useWorkspace();
  const { isLoading: isCtxLoading } = useUI();
  const { metrics, isLoading: isMetricsLoading, error } = useDashboardMetrics();
  const t = useI18n();

  const isLoading = isCtxLoading || isMetricsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative bg-background border border-border/50 rounded-2xl p-6 shadow-2xl">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] animate-pulse">
            Syncing Metrics
          </p>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
            Global Protocol Initialization
          </p>
        </div>
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="max-w-2xl mx-auto pt-24">
        <EmptyState
          title="Namespace Isolation"
          description="No active workspace node detected. Reconnect or provision a new environment."
          icon={<Globe className="w-10 h-10" />}
          actionLabel="Switch Environment"
          onAction={() => (window.location.href = "/workspaces")}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="p-12 text-center bg-destructive/5 text-destructive rounded-[2.5rem] border border-destructive/10 selection:bg-destructive/20 animate-in fade-in duration-500"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <p className="font-black uppercase tracking-[0.3em] text-xs">
              Critical Sync Error
            </p>
            <p className="font-semibold text-sm opacity-80">
              Cluster diagnostics failed to retrieve metric packets.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl"
          >
            Retry Handshake
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header / Filter Row */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-8 border-b border-border/50">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-bold text-foreground tracking-tighter underline decoration-primary/20 underline-offset-8">
                Terminal Overview
              </h1>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1 ml-1">
                System Telemetry
              </span>
            </div>
          </div>
          <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-md ml-1">
            Real-time telemetry and global node performance metrics for{" "}
            <span className="text-foreground font-bold underline decoration-primary/30 underline-offset-2">
              {activeWorkspace.name}
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-5 h-14 bg-secondary/20 border border-border/50 rounded-2xl text-[10px] font-bold text-foreground shadow-sm hover:border-primary/30 hover:bg-secondary/30 transition-all cursor-pointer group">
            <span className="text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">
              Oct 18 — Nov 18
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground/50 transition-transform group-hover:rotate-180" />
          </div>
          <div className="flex items-center gap-3 px-5 h-14 bg-secondary/20 border border-border/50 rounded-2xl text-[10px] font-bold text-foreground shadow-sm hover:border-primary/30 hover:bg-secondary/30 transition-all cursor-pointer group">
            <span className="uppercase tracking-widest">Monthly Frequency</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground/50 transition-transform group-hover:rotate-180" />
          </div>
          <button className="h-14 w-14 border border-border/50 bg-background rounded-2xl text-muted-foreground hover:bg-foreground hover:text-background transition-all shadow-sm flex items-center justify-center group active:scale-90">
            <Filter className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button className="flex items-center gap-3 px-8 h-14 bg-foreground text-background rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-foreground/5 hover:bg-foreground/90 transition-all active:scale-95 group">
            <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Export Protocol
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          icon={<Eye className="w-5 h-5" />}
          title="Neural Impressions"
          value={((metrics?.totalTasks ?? 0) * 12 + 12450).toLocaleString()}
          trend="15.8%"
          trendType="up"
        />
        <MetricCard
          icon={<Banknote className="w-5 h-5" />}
          title="Revenue Stream"
          value={`$${((metrics?.teamMembers ?? 0) * 120 + 363.95).toFixed(2)}`}
          trend="3.4%"
          trendType="down"
        />
        <MetricCard
          icon={<Timer className="w-5 h-5" />}
          title="Ejection Rate"
          value="86.5%"
          trend="2.2%"
          trendType="up"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-12 lg:grid-cols-3">
        <Card className="lg:col-span-2 border border-border/50 bg-background/50 backdrop-blur-sm shadow-2xl shadow-primary/[0.02] rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-border/50 flex items-center justify-between bg-secondary/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground tracking-tight underline decoration-primary/20 underline-offset-4">
                  Node Distribution
                </h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
                  Global Propagation Telemetry
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-3 px-4 h-10 bg-secondary/30 border border-border/50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-secondary/50 transition-all">
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>
              <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-all">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
          <CardContent className="p-10">
            <div className="flex items-baseline gap-4 mb-12">
              <span className="text-4xl font-bold text-foreground tracking-tighter">
                $ 9,257.51
              </span>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/10">
                <Zap className="w-3.5 h-3.5 fill-current" />+ $143.50
                Acceleration
              </div>
            </div>

            <div className="h-[250px] flex items-end justify-between gap-6 px-4 pt-4">
              {[
                { month: "Oct", bars: [30, 45, 60, 40, 50, 20] },
                { month: "Nov", bars: [20, 30, 50, 45, 40, 35] },
                { month: "Dec", bars: [60, 80, 95, 70, 85, 40] },
              ].map((group, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center group/group h-full max-w-[120px]"
                >
                  <div className="w-full flex items-end justify-center gap-1.5 mb-6 h-full relative">
                    {group.bars.map((h, j) => (
                      <div
                        key={j}
                        className={cn(
                          "w-full rounded-full transition-all duration-700 hover:scale-y-110 hover:shadow-lg",
                          [
                            "bg-foreground",
                            "bg-primary",
                            "bg-emerald-500",
                            "bg-indigo-500",
                            "bg-secondary",
                            "bg-muted",
                          ][j],
                        )}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    {group.month} Partition
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8 border-t border-border/50">
              {[
                { label: "Mainnet", color: "bg-foreground" },
                { label: "EU Cluster", color: "bg-primary" },
                { label: "US Region", color: "bg-emerald-500" },
                { label: "Asia/PAC", color: "bg-indigo-500" },
                { label: "Isolated", color: "bg-muted" },
              ].map((tag, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full shadow-sm",
                      tag.color,
                    )}
                  />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {tag.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-background/50 backdrop-blur-sm shadow-2xl shadow-primary/[0.02] rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-border/50 flex items-center justify-between bg-secondary/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center text-foreground shadow-inner">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground tracking-tight underline decoration-primary/20 underline-offset-4">
                  Subscribers
                </h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
                  Neural Network Growth
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg text-[9px] font-black uppercase tracking-widest text-foreground border border-border/50">
              Cyclic{" "}
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
          </div>
          <CardContent className="p-8">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-4xl font-bold text-foreground tracking-tighter italic">
                24,473
              </span>
              <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
                <ArrowUpRight className="w-3.5 h-3.5" />
                8.3% Pulse
              </div>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-12">
              + 749 New Connections Injected
            </p>

            <div className="h-[180px] flex items-end justify-between gap-4 px-2">
              {[20, 35, 90, 45, 60, 30, 55].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center h-full group/bar max-w-[40px]"
                >
                  <div className="w-full flex items-end h-full mb-4">
                    <div
                      className={cn(
                        "w-full rounded-2xl transition-all duration-700 hover:scale-x-110",
                        i === 2
                          ? "bg-foreground shadow-2xl shadow-foreground/20"
                          : "bg-secondary group-hover/bar:bg-secondary/70",
                      )}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                    {["SN", "MN", "TU", "WD", "TH", "FR", "ST"][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Table Section */}
      <div className="grid gap-12 lg:grid-cols-2">
        <Card className="border border-border/50 bg-background/50 backdrop-blur-sm shadow-2xl shadow-primary/[0.02] rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-border/50 flex items-center justify-between bg-secondary/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground tracking-tight underline decoration-primary/20 underline-offset-4">
                  Resource Allocation
                </h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
                  Cross-Platform Distribution
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-secondary/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-foreground border border-border/50">
              Static Analysis{" "}
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
          </div>
          <CardContent className="p-12 h-[320px] flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-secondary/5">
            <div className="relative w-48 h-24 overflow-hidden mb-12">
              <div className="absolute inset-0 border-[20px] border-secondary/50 rounded-full" />
              <div
                className="absolute inset-0 border-[20px] border-foreground rounded-full transition-all duration-1000"
                style={{
                  clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 50% 10%)",
                }}
              />
              <div
                className="absolute inset-0 border-[20px] border-primary rounded-full transition-all duration-1000 delay-200"
                style={{
                  clipPath: "polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)",
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-12 w-full max-w-sm">
              <div className="text-center space-y-2 group">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground shadow-sm animate-pulse" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest transition-colors group-hover:text-foreground">
                    Web
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground italic tracking-tight">
                  $ 374.8k
                </p>
              </div>
              <div className="text-center space-y-2 group">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm animate-pulse" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest transition-colors group-hover:text-foreground">
                    Mobile
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground italic tracking-tight">
                  $ 241.6k
                </p>
              </div>
              <div className="text-center space-y-2 group">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted shadow-sm" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest transition-colors group-hover:text-foreground">
                    Legacy
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground italic tracking-tight">
                  $ 213.4k
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-background/50 backdrop-blur-sm shadow-2xl shadow-primary/[0.02] rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-border/50 flex items-center justify-between bg-secondary/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center text-foreground shadow-inner">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground tracking-tight underline decoration-primary/20 underline-offset-4">
                  Helix Integrations
                </h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
                  Cross-Protocol Connections
                </p>
              </div>
            </div>
            <a
              href="/integrations"
              className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-[0.2em] group"
            >
              Full Diagnostics{" "}
              <ChevronRight
                className="w-3 h-3 inline-block ml-1 group-hover:translate-x-1 transition-transform"
                strokeWidth={3}
              />
            </a>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] border-b border-border/50 bg-secondary/20">
                    <th className="px-8 py-5">Application Node</th>
                    <th className="px-8 py-5">Protocol Type</th>
                    <th className="px-8 py-5">Sync Rate</th>
                    <th className="px-8 py-5 text-right">Yield</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    {
                      name: "Polar.sh",
                      type: "Billing Node",
                      rate: 98,
                      profit: "$6,500.00",
                      color: "bg-foreground",
                      icon: <Fingerprint className="w-4 h-4" />,
                    },
                    {
                      name: "Stripe",
                      type: "Finance Core",
                      rate: 100,
                      profit: "$12,720.50",
                      color: "bg-primary",
                      icon: <Database className="w-4 h-4" />,
                    },
                    {
                      name: "PostgreSQL",
                      type: "Core Database",
                      rate: 84,
                      profit: "$4,321.25",
                      color: "bg-secondary text-foreground",
                      icon: <Zap className="w-4 h-4" />,
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className="group hover:bg-secondary/30 transition-all duration-300"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-black/5 group-hover:scale-110 group-hover:-rotate-3 transition-all",
                              row.color,
                            )}
                          >
                            {row.icon}
                          </div>
                          <span className="font-bold text-foreground tracking-tight italic">
                            {row.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            {row.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-secondary h-1.5 rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                row.rate > 90 ? "bg-primary" : "bg-foreground",
                              )}
                              style={{ width: `${row.rate}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                            {row.rate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-foreground tracking-tight">
                        {row.profit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <div className="p-6 bg-secondary/10 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Security Integrity Nominal
            </div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
              Cluster:{" "}
              <span className="text-foreground">EdgeStack v1.0.Beta</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { cn } from "@workspace/ui";
