import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "../../utils.js";
import { Card } from "./Card.js";

export interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendLabel?: string;
  variant?: "default" | "primary" | "secondary" | "accent";
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  variant = "default",
  className,
}) => {
  const variants = {
    default: "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#FFFFFF]/5",
    primary: "bg-[#004080] text-white border-none shadow-lg shadow-[#004080]/10",
    secondary: "bg-[#00E6E6] text-[#004080] border-none shadow-lg shadow-[#00E6E6]/10",
    accent: "bg-[#0F172A] text-white border-none shadow-lg",
  };

  const iconVariants = {
    default: "bg-[#004080]/5 text-[#004080] dark:bg-[#00E6E6]/5 dark:text-[#00E6E6]",
    primary: "bg-white/10 text-white",
    secondary: "bg-[#004080]/10 text-[#004080]",
    accent: "bg-white/10 text-white",
  };

  return (
    <Card
      className={cn(
        "relative group p-6 transition-all duration-300 hover:translate-y-[-4px] active:scale-[0.98]",
        variants[variant],
        className
      )}
    >
      <div className="flex flex-col justify-between h-full gap-8">
        <div className="flex items-center justify-between">
          <div className={cn("rounded-2xl p-3 transition-transform group-hover:scale-110", iconVariants[variant])}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div className={cn(
              "px-2.5 py-1 rounded-full flex items-center gap-1 border transition-colors",
              variant === "default"
                ? "bg-[#F8FAFC] border-[#E2E8F0] dark:bg-[#0F172A] dark:border-[#FFFFFF]/10"
                : "bg-white/10 border-white/20"
            )}>
              <span className="text-[10px] font-label uppercase tracking-widest">{trend}</span>
            </div>
          )}
        </div>
        <div>
          <h3 className={cn(
            "text-[36px] font-kpi leading-none tracking-tight",
            variant === "default" ? "text-[#0F172A] dark:text-[#F8FAFC]" : ""
          )}>
            {value}
          </h3>
          <p className={cn(
            "text-[11px] font-label uppercase tracking-[0.15em] mt-2",
            variant === "default" ? "text-[#64748B] dark:text-[#94A3B8]" : "opacity-80"
          )}>
            {label}
          </p>
        </div>
      </div>
    </Card>
  );
};
