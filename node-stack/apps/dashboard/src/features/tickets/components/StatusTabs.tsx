import { TicketStatus } from "@node-stack/types";
import { FilterTabs } from "@node-stack/ui";
import { statusTabs } from "../config";

interface StatusTabsProps {
  activeTab: TicketStatus | "all";
  onChange: (tab: TicketStatus | "all") => void;
  counts?: Partial<Record<TicketStatus | "all", number>>;
}

export const StatusTabs = ({ activeTab, onChange, counts }: StatusTabsProps) => (
  <FilterTabs
    value={activeTab}
    onChange={(v) => onChange(v as TicketStatus | "all")}
    ariaLabel="Filtrar tickets por estado"
    options={statusTabs.map((tab) => ({
      value: tab.key,
      label: tab.label,
      count: counts?.[tab.key],
    }))}
  />
);
