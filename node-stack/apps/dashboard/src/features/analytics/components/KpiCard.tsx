import { Card, Badge } from "@node-stack/ui";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/classNames";

interface KpiCardProps {
  label: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: LucideIcon;
  tooltip: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, trend, isPositive, icon: Icon }) => (
  <Card className="p-7 rounded-[24px] border-slate-100 dark:border-white/5 bg-white dark:bg-[#12] shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center justify-between mb-6">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-primary/10 flex items-center justify-center text-primary dark:text-primary-light group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5" />
      </div>
      <Badge className={cn(
        "bg-transparent border-none font-label text-xs flex items-center gap-1 px-0",
        isPositive ? "text-emerald-500" : "text-rose-500"
      )}>
        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        {trend}
      </Badge>
    </div>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-[11px] font-heading text-slate-400 uppercase">{label}</h3>
        <Info className="w-3 h-3 text-slate-300 cursor-help" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-kpi text-slate-900 dark:text-white">{value}</span>
      </div>
    </div>
  </Card>
);