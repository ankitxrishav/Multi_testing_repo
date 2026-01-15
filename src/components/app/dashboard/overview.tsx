
"use client";

import { ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart, CartesianGrid } from "recharts";
import { format, startOfDay, subDays } from "date-fns";
import { useMemo } from "react";
import { Session } from "@/lib/definitions";

interface OverviewProps {
  sessions: Session[] | null;
}

export function Overview({ sessions }: OverviewProps) {
  const data = useMemo(() => {
    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      return {
        name: format(date, 'MMM dd'),
        date,
        total: 0,
      };
    });

    if (sessions) {
      sessions.forEach(session => {
        const sessionDayStart = startOfDay(new Date(session.startTime));
        const dayData = weeklyData.find(d => d.date.getTime() === sessionDayStart.getTime());
        if (dayData) {
          dayData.total += session.duration; // duration in seconds
        }
      });
    }

    return weeklyData.map(d => ({
      name: d.name,
      total: Math.round((d.total / 3600) * 10) / 10 // Convert to hours
    }));
  }, [sessions]);

  if (!sessions) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-slate-500 animate-pulse font-bold uppercase tracking-widest text-[10px]">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
            tickFormatter={(value) => `${value}h`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 14, 39, 0.9)',
              borderColor: 'rgba(139, 92, 246, 0.2)',
              borderRadius: '20px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              borderWidth: '1px',
              padding: '12px'
            }}
            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
            cursor={{ stroke: 'rgba(139, 92, 246, 0.3)', strokeWidth: 2 }}
            formatter={(value: number) => [`${value} hours`, 'Study Time']}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#8B5CF6"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorTotal)"
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

