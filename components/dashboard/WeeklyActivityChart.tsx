"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartPoint = {
  day: string;
  activity: number;
};

export function WeeklyActivityChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="activity" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--text))" stopOpacity={0.22} />
            <stop offset="100%" stopColor="rgb(var(--text))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgb(var(--line) / 0.06)" vertical={false} />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "rgb(var(--text-tertiary))", fontSize: 12 }}
          dy={6}
        />
        <YAxis hide domain={[0, "dataMax + 2"]} />
        <Tooltip content={<ActivityTooltip />} cursor={{ stroke: "rgb(var(--line) / 0.25)", strokeDasharray: "4 4" }} />
        <Area
          type="monotone"
          dataKey="activity"
          stroke="rgb(var(--text))"
          strokeWidth={2}
          fill="url(#activity)"
          activeDot={{ r: 4, strokeWidth: 0, fill: "rgb(var(--text))" }}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ActivityTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-hairline bg-elevated px-3 py-2 text-sm shadow-lg">
      <div className="font-medium text-content">{label}</div>
      <div className="tnum mt-0.5 text-xs text-content-secondary">{payload[0].value ?? 0} tracked actions</div>
    </div>
  );
}
