import React, { useState } from "react";
import { LucideIcon, Info } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  value: React.ReactNode | string;
  change?: string | number;
  isPositive?: boolean;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  gradient?: string;
  iconColor?: string;
  delay?: number;
  variant?: "primary" | "secondary";
  subtext?: string;
  infoTooltip?: string;
}

const TooltipContent: React.FC<{ text: string; visible: boolean }> = ({
  text,
  visible,
}) => (
  <div
    className={`absolute right-0 top-full mt-2 w-72 p-4 rounded-xl bg-gray-900 dark:bg-black/90 backdrop-blur-md text-white text-[13px] leading-relaxed shadow-2xl border border-white/10 z-[9999] transition-all duration-150 origin-top-right ${
      visible
        ? "opacity-100 scale-100"
        : "opacity-0 scale-95 pointer-events-none"
    }`}
    style={{ isolation: "isolate" }}
  >
    <div className="absolute -top-1.5 right-4 w-3 h-3 bg-gray-900 dark:bg-black/90 transform rotate-45 border-l border-t border-white/10" />
    {text}
  </div>
);

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  subtitle,
  value,
  icon: Icon,
  gradient = "from-primary-400 via-primary-500 to-primary-600",
  iconColor = "text-primary-500 bg-primary-50 dark:bg-primary-900/20",
  delay = 0,
  variant = "secondary",
  subtext,
  infoTooltip,
  isPositive: isPosInitial,
  trend,
  change,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isPositive =
    trend === "up" ||
    isPosInitial ||
    (typeof change === "number" && change > 0);
  const isNegative =
    trend === "down" ||
    isPosInitial === false ||
    (typeof change === "number" && change < 0);

  const formattedChange =
    typeof change === "number"
      ? `${change > 0 ? "+" : ""}${change}%`
      : change;

  const tooltipTriggerProps = {
    onMouseEnter: () => setShowTooltip(true),
    onMouseLeave: () => setShowTooltip(false),
    onClick: () => setShowTooltip((v) => !v),
  };

  if (variant === "primary") {
    return (
      <div
        className={`relative flex flex-col justify-between p-6 lg:p-7 rounded-[20px] shadow-sm bg-gradient-to-br ${gradient} text-white transition-all hover:shadow-md overflow-visible animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both`}
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="bg-white/15 p-2.5 rounded-xl">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white/90 text-base">
              {title}
            </span>
          </div>

          {infoTooltip && (
            <div className="relative flex-shrink-0" {...tooltipTriggerProps}>
              <div className="p-1.5 bg-white/10 hover:bg-white/25 rounded-full transition-colors cursor-pointer">
                <Info className="w-4 h-4 text-white" />
              </div>
              <TooltipContent text={infoTooltip} visible={showTooltip} />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <h3 className="text-[32px] font-bold leading-none tracking-tight min-h-[40px]">
              {value}
            </h3>
            {subtext && (
              <p className="text-white/75 text-sm mt-1.5">{subtext}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Secondary (white) card
  return (
    <div
      className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-[20px] p-6 shadow-sm dark:shadow-none border border-gray-100 dark:border-white/10 flex flex-col justify-between transition-all border-transparent hover:border-blue-100 dark:hover:border-blue-900/40 hover:shadow-md dark:hover:shadow-none overflow-visible animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-semibold text-gray-700 dark:text-gray-200 text-[15px]">
            {title}
          </span>
        </div>

        {infoTooltip && (
          <div className="relative flex-shrink-0" {...tooltipTriggerProps}>
            <div className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full transition-colors cursor-pointer">
              <Info className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <TooltipContent text={infoTooltip} visible={showTooltip} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-none min-h-[36px]">
            {value}
          </h3>
          {formattedChange && (
            <div
              className={`flex items-center gap-1 mt-1.5 text-sm font-bold ${
                isPositive
                  ? "text-green-500"
                  : isNegative
                  ? "text-red-500"
                  : "text-gray-400"
              }`}
            >
              {isPositive ? "↑" : isNegative ? "↓" : ""} {formattedChange}
              {subtitle && (
                <span className="text-gray-400 font-medium ml-1">
                  · {subtitle}
                </span>
              )}
            </div>
          )}
          {!formattedChange && subtitle && (
            <p className="text-sm text-gray-400 font-medium mt-1.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
