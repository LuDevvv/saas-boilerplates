import { FC } from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/utils/classNames";

interface AdminStatCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  color: string;
}

export const AdminStatCard: FC<AdminStatCardProps> = ({
  label,
  value,
  change,
  trend,
  icon: Icon,
  color,
}) => {
  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-gray-100 bg-white/80 backdrop-blur-md p-6 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md dark:border-white/10 dark:bg-gray-900/50 active:scale-95">
      <div className="flex items-center justify-between relative z-10">
        <div className={cn("rounded-xl p-3 shadow-sm transition-transform group-hover:rotate-6", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-[10px] font-label px-2 py-0.5 rounded-full uppercase border",
            trend === "up"
              ? "bg-green-50 text-green-600 border-green-200"
              : trend === "down"
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-gray-50 text-gray-500 border-gray-200"
          )}
        >
          {change}
          {trend === "up" ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : trend === "down" ? (
            <ArrowDownRight className="h-3 w-3" />
          ) : null}
        </div>
      </div>
      <div className="mt-5 relative z-10">
        <p className="text-[11px] font-label uppercase text-gray-400 mb-1">{label}</p>
        <h3 className="text-30px font-kpi text-gray-950 dark:text-white leading-none">{value}</h3>
      </div>

      <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-primary-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};