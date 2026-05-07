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
    default: "bg-white dark:bg-canvas-dark border-border",
    primary: "bg-gradient-to-br from-primary to-primary-600 text-white border-none shadow-xl shadow-primary/20",
    secondary: "bg-gradient-to-br from-secondary to-secondary-600 text-white border-none shadow-xl shadow-secondary/20",
    accent: "bg-gradient-to-br from-gray-800 to-gray-950 text-white border-none shadow-xl",
  };

  const iconVariants = {
    default: "bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary-light",
    primary: "bg-white/10 text-white",
    secondary: "bg-white/10 text-white",
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
          <div className={cn("rounded-xl p-3 transition-transform group-hover:scale-110", iconVariants[variant])}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div className={cn(
              "px-2.5 py-1 rounded-full flex items-center gap-1 border transition-colors",
              variant === "default"
                ? "bg-gray-50 border-gray-100 dark:bg-white/5 dark:border-white/10"
                : "bg-white/10 border-white/20"
            )}>
              <span className="text-[10px] font-bold uppercase ">{trend}</span>
            </div>
          )}
        </div>
        <div>
          <h3 className={cn(
            "text-[32px] font-bold leading-none ",
            variant === "default" ? "text-fg" : ""
          )}>
            {value}
          </h3>
          <p className={cn(
            "text-[11px] font-extrabold uppercase mt-2",
            variant === "default" ? "text-fg-secondary" : "opacity-80"
          )}>
            {label}
          </p>
        </div>
      </div>
    </Card>
  );
};
