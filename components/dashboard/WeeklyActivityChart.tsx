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
            <stop offset="0%" stopColor="#7cf7d4" stopOpacity={0.42} />
            <stop offset="100%" stopColor="#7cf7d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8a93a6", fontSize: 12 }} />
        <YAxis hide domain={[0, "dataMax + 2"]} />
        <Tooltip content={<ActivityTooltip />} cursor={{ stroke: "rgba(124,247,212,0.24)" }} />
        <Area type="monotone" dataKey="activity" stroke="#7cf7d4" strokeWidth={2} fill="url(#activity)" activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ActivityTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-[#090d15]/95 px-3 py-2 text-sm shadow-panel backdrop-blur-xl">
      <div className="font-medium text-white">{label}</div>
      <div className="mt-1 text-xs text-slate-400">{payload[0].value ?? 0} tracked actions</div>
    </div>
  );
}
