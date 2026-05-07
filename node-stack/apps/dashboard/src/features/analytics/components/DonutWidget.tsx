import { FC } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

interface DonutWidgetProps {
  title: string;
  data: DonutSlice[];
  centerLabel?: string;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

const ChartTooltip: FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-white dark:bg-surface-elevated border border-border rounded-[12px] px-3 py-2 shadow-lg text-[12px]">
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: p.payload.color }} />
        <span className="font-semibold text-fg">{p.name}</span>
      </div>
      <p className="text-gray-400 mt-1 tabular-nums">{p.value}%</p>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export const DonutWidget: FC<DonutWidgetProps> = ({
  title,
  data,
  centerLabel = "Total",
}) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-[20px] border border-border bg-white dark:bg-surface p-5 flex flex-col gap-5 h-full">
      <h3 className="text-[14px] font-semibold text-fg">{title}</h3>

      {/* Donut chart */}
      <div className="relative" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              isAnimationActive={false}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip
              content={<ChartTooltip />}
              wrapperStyle={{ outline: "none", zIndex: 50 }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label — inset-0 guarantees exact centering regardless of container size */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[20px] font-semibold text-fg tabular-nums leading-none">
            {total}%
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{centerLabel}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2.5">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-[12px] text-fg-secondary truncate">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Mini progress */}
              <div className="w-16 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${item.value}%`, background: item.color }}
                />
              </div>
              <span className="text-[12px] font-semibold text-fg tabular-nums w-9 text-right">
                {item.value}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
