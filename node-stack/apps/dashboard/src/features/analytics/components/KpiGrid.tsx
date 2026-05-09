import { FC } from "react";

import { KpiCard, type KpiCardProps } from "./KpiCard";

interface KpiGridProps {
  kpis: KpiCardProps[];
}

export const KpiGrid: FC<KpiGridProps> = ({ kpis }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
    {kpis.map((kpi, i) => (
      <KpiCard key={i} {...kpi} />
    ))}
  </div>
);
