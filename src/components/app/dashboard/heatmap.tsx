"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

interface HeatmapProps {
    sessions: any[];
}

export function ActivityHeatmap({ sessions }: HeatmapProps) {
    // Generate last 6 months of data
    const today = new Date();
    const startDate = subDays(today, 180); // Last 6 months approx

    const days = eachDayOfInterval({ start: startDate, end: today });

    const getIntensity = (date: Date) => {
        const daySessions = sessions.filter(s => isSameDay(new Date(s.startTime), date));
        const totalDuration = daySessions.reduce((acc, s) => acc + s.duration, 0);

        if (totalDuration === 0) return 0;
        if (totalDuration < 3600) return 1; // < 1h
        if (totalDuration < 10800) return 2; // < 3h
        if (totalDuration < 21600) return 3; // < 6h
        return 4; // > 6h
    };

    const colors = [
        'bg-white/5',
        'bg-brand-purple/20',
        'bg-brand-purple/40',
        'bg-brand-purple/70',
        'bg-brand-purple',
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-display uppercase tracking-wider text-slate-300">Activity Heatmap</h3>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    <span>Less</span>
                    <div className="flex gap-1">
                        {colors.map((c, i) => (
                            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="glass p-6 rounded-3xl border-white/5 overflow-x-auto">
                <div className="flex gap-1.5 min-w-max">
                    {/* Group by weeks for better layout */}
                    <div className="grid grid-flow-col grid-rows-7 gap-1.5 ">
                        {days.map((day, idx) => {
                            const intensity = getIntensity(day);
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.002 }}
                                    className={`w-3.5 h-3.5 rounded-[3px] ${colors[intensity]} transition-colors hover:ring-2 ring-white/20 relative group`}
                                >
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 glass-elevated rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                        {format(day, 'MMM d, yyyy')}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
