import { Card, Button } from "@node-stack/ui";
import { BarChart3, MoreHorizontal } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SalesData } from "../types";

interface SalesChartProps {
  data: SalesData[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => (
  <Card className="lg:col-span-2 p-8 rounded-[32px] border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm">
    <div className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-50 dark:bg-[#00E6E6]/5 rounded-xl">
          <BarChart3 className="w-5 h-5 text-[#004080] dark:text-[#00E6E6]" />
        </div>
        <div>
          <h3 className="text-[11px] font-heading text-slate-400 uppercase">Rendimiento de Ventas</h3>
          <p className="text-xl font-kpi text-slate-900 dark:text-white">$446,720.00 <span className="text-[10px] text-emerald-500 font-label">+12%</span></p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="text-slate-400">
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    </div>

    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#004080" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#004080" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor" }}
            className="text-slate-400 dark:text-gray-500"
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor" }}
            className="text-slate-400 dark:text-gray-500"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--tooltip-bg, #FFFFFF)",
              borderRadius: "16px",
              border: "1px solid var(--tooltip-border, #E2E8F0)",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              fontSize: "12px",
              color: "var(--tooltip-text, #000)",
            }}
            itemStyle={{ color: "inherit" }}
          />
          <Area
            type="monotone"
            dataKey="current"
            stroke="#004080"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorCurrent)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Card>
);