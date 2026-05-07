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
  discountLabel = "-15%",
}) => {
  return (
    <div className={cn("flex items-center justify-center py-1", className)}>
      <div className="relative flex items-center p-1 bg-surface-muted rounded-[16px] border border-border w-fit shadow-[var(--shadow-sm)]">
        {/* Sliding pill */}
        <div
          className={cn(
            "absolute inset-y-1 w-[calc(50%-4px)] bg-surface border border-border-subtle rounded-[12px] shadow-[var(--shadow-sm)] transition-all duration-400 ease-out pointer-events-none",
            isAnnualBilling ? "left-[calc(50%+2px)]" : "left-1"
          )}
        />

        <button
          onClick={() => onChange(false)}
          className={cn(
            "relative z-10 w-[120px] py-2.5 rounded-xl text-[13px] font-medium transition-colors duration-300 text-center",
            !isAnnualBilling ? "text-fg" : "text-fg-muted hover:text-fg-secondary"
          )}
        >
          {monthlyLabel}
        </button>

        <button
          onClick={() => onChange(true)}
          className={cn(
            "relative z-10 w-[120px] py-2.5 rounded-xl text-[13px] font-medium transition-colors duration-300 flex items-center justify-center gap-1.5",
            isAnnualBilling ? "text-fg" : "text-fg-muted hover:text-fg-secondary"
          )}
        >
          {annualLabel}
          {discountLabel && (
            <span className={cn(
              "text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none",
              isAnnualBilling
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                : "text-fg-muted bg-surface-hover"
            )}>
              {discountLabel}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
