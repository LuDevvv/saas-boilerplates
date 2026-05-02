import React from "react";
import { cn } from "../../utils.js";

export interface BillingToggleProps {
  isAnnualBilling: boolean;
  onChange: (isAnnual: boolean) => void;
  className?: string;
  monthlyLabel?: string;
  annualLabel?: string;
  discountLabel?: string;
}

export const BillingToggle: React.FC<BillingToggleProps> = ({
  isAnnualBilling,
  onChange,
  className,
  monthlyLabel = "Mensual",
  annualLabel = "Anual",
  discountLabel = "-20%",
}) => {
  return (
    <div className={cn("flex items-center justify-center py-2", className)}>
      <div className="relative flex items-center p-1 bg-gray-100/80 dark:bg-white/5 backdrop-blur-md rounded-[16px] border border-gray-200 dark:border-white/10 w-fit shadow-sm">
        {/* Sliding background */}
        <div
          className={cn(
            "absolute inset-y-1 w-[calc(50%-4px)] bg-white dark:bg-white/10 rounded-[12px] shadow-sm transition-all duration-500 ease-out-expo pointer-events-none",
            isAnnualBilling ? "left-[calc(50%+2px)]" : "left-1"
          )}
        />

        <button
          onClick={() => onChange(false)}
          className={cn(
            "relative z-10 px-6 py-2 rounded-xl text-[11px] font-label uppercase  transition-colors duration-300 min-w-[110px]",
            !isAnnualBilling
              ? "text-gray-950 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          )}
        >
          {monthlyLabel}
        </button>
        <button
          onClick={() => onChange(true)}
          className={cn(
            "relative z-10 px-6 py-2 rounded-xl text-[11px] font-label uppercase  transition-colors duration-300 min-w-[110px] flex items-center justify-center gap-2",
            isAnnualBilling
              ? "text-gray-950 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          )}
        >
          {annualLabel}
          <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-lg font-label shadow-sm">
            {discountLabel}
          </span>
        </button>
      </div>
    </div>
  );
};
