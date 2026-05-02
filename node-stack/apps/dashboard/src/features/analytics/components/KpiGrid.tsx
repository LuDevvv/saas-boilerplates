import { KpiCard } from "./KpiCard";
import type { Kpi } from "../types";

interface KpiGridProps {
  kpis: Kpi[];
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
    {kpis.map((kpi, i) => (
      <KpiCard key={i} {...kpi} />
    ))}
  </div>
);