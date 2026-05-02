import { Card } from "@node-stack/ui";
import { cn } from "@/utils/classNames";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import type { ActivityData } from "../types";

interface ActivityChartProps {
  data: ActivityData[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => (
  <Card className="p-8 rounded-[32px] border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm">
    <div className="mb-8">
      <h3 className="text-sm font-heading text-slate-900 dark:text-white uppercase">Actividad por Canal</h3>
      <p className="text-[10px] font-label text-slate-400 uppercase mt-1">Distribución Semanal</p>
    </div>

    <div className="space-y-8">
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Bar dataKey="value" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.day === "Tue" ? "#00E6E6" : "#004080"}
                  opacity={entry.day === "Tue" ? 1 : 0.1}
                />
              ))}
            </Bar>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: "#94A3B8" }} dy={5} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
        {[
          { name: "Directo", value: "45%", color: "bg-[#004080]" },
          { name: "Referidos", value: "30%", color: "bg-[#00E6E6]" },
          { name: "Social", value: "25%", color: "bg-slate-200" }
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", item.color)} />
              <span className="text-[11px] font-label text-slate-500">{item.name}</span>
            </div>
            <span className="text-[11px] font-kpi text-slate-900 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  </Card>
);