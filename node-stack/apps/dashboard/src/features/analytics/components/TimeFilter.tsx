import { Button } from "@node-stack/ui";

import type { TimeFilter as TimeFilterType } from "../types";

import { cn } from "@/utils/classNames";

interface TimeFilterProps {
  value: TimeFilterType;
  onChange: (filter: TimeFilterType) => void;
}

const filterButtons = [
  { id: "day" as TimeFilterType, label: "Día" },
  { id: "week" as TimeFilterType, label: "Semana" },
  { id: "month" as TimeFilterType, label: "Mes" },
];

export const TimeFilter: React.FC<TimeFilterProps> = ({ value, onChange }) => (
  <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-1.5 rounded-2xl border border-border-subtle shadow-sm">
    {filterButtons.map((btn) => (
      <Button
        key={btn.id}
        variant={value === btn.id ? "primary" : "ghost"}
        size="sm"
        onClick={() => onChange(btn.id)}
        className={cn(
          "rounded-xl text-[10px] font-heading uppercase transition-all",
          value === btn.id
            ? "w-full h-10 px-6 bg-primary text-white shadow-2xl shadow-blue-900/20 active:scale-95"
            : "text-slate-400 hover:text-[#004080]"
        )}
      >
        {btn.label}
      </Button>
    ))}
  </div>
);