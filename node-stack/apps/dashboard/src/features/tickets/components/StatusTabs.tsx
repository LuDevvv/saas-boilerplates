import { TicketStatus } from "../api/tickets.api";
import { statusTabs } from "../api/tickets.api";
import { cn } from "@/utils/classNames";

interface StatusTabsProps {
  activeTab: TicketStatus | "all";
  onChange: (tab: TicketStatus | "all") => void;
}

export const StatusTabs = ({ activeTab, onChange }: StatusTabsProps) => (
  <div className="flex items-center gap-1 rounded-[20px] bg-white/80 backdrop-blur-md p-1.5 border border-gray-100 dark:bg-gray-900/50 dark:border-white/10 shadow-sm w-fit">
    {statusTabs.map((tab) => (
      <button
        key={tab.key}
        onClick={() => onChange(tab.key)}
        className={cn(
          "rounded-[14px] px-5 py-2.5 text-[10px] font-label  transition-all duration-300 active:scale-95",
          activeTab === tab.key
            ? "bg-primary-600 text-white shadow-lg shadow-blue-900/20"
            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);