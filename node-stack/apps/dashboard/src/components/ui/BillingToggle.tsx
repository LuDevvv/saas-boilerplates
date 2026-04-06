import React from "react";
import { cn } from "@/utils/classNames";

interface BillingToggleProps {
  isAnnualBilling: boolean;
  onChange: (isAnnual: boolean) => void;
}

const BillingToggle: React.FC<BillingToggleProps> = ({
  isAnnualBilling,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-center py-2">
      <div className="relative flex items-center p-0.5 bg-gray-100 dark:bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 w-fit">
        {/* Sliding background */}
        <div
          className={cn(
            "absolute inset-y-0.5 w-[calc(50%-2px)] bg-white dark:bg-gray-700 rounded-lg shadow-sm transition-all duration-300 ease-out-expo pointer-events-none",
            isAnnualBilling ? "left-[calc(50%+1px)]" : "left-0.5"
          )}
        />

        <button
          onClick={() => onChange(false)}
          className={cn(
            "relative z-10 px-5 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300 min-w-[100px]",
            !isAnnualBilling
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          )}
        >
          Mensual
        </button>
        <button
          onClick={() => onChange(true)}
          className={cn(
            "relative z-10 px-5 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300 min-w-[100px] flex items-center justify-center gap-1.5",
            isAnnualBilling
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          )}
        >
          Anual
          <span className="bg-primary-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-black">
            -20%
          </span>
        </button>
      </div>
    </div>
  );
};

export default BillingToggle;
