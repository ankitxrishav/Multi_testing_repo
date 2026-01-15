"use client";
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  time: number;
  initialDuration: number;
  mode: 'pomodoro' | 'stopwatch';
  faceType?: 'cosmic' | 'minimalist' | 'geometric';
}

const formatTime = (totalSeconds: number) => {
  const roundedSeconds = Math.floor(totalSeconds);
  const seconds = roundedSeconds % 60;
  const minutes = Math.floor(roundedSeconds / 60);
  const hours = Math.floor(minutes / 60);

  const h = hours > 0 ? `${hours}:` : '';
  const m = String(minutes % 60).padStart(h ? 2 : 2, '0');
  const s = String(seconds).padStart(2, '0');

  return `${h}${m}:${s}`;
};

export function TimerDisplay({ time, initialDuration, mode, faceType = 'cosmic' }: TimerDisplayProps) {
  const radius = 130;
  const circumference = 2 * Math.PI * radius;

  // Progress calculation
  let progress = 0;
  if (mode === 'pomodoro' && initialDuration > 0) {
    progress = 1 - (time / initialDuration);
  } else if (mode === 'stopwatch') {
    progress = (time % 60) / 60;
  }

  const strokeDashoffset = circumference * (1 - progress);
  const timeString = useMemo(() => formatTime(time), [time]);

  // Dynamic font size calculation
  // Base size for MM:SS (5 chars) is text-8xl (~96px)
  // For H:MM:SS (7-8 chars) we should reduce it.
  const getFontSize = (): string => {
    const len = timeString.length;
    if (len <= 5) return 'text-7xl md:text-8xl';
    if (len <= 7) return 'text-6xl md:text-7xl';
    return 'text-5xl md:text-6xl';
  };

  return (
    <div className="relative flex items-center justify-center w-[260px] h-[260px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px]">
      {/* Background Ring */}
      <svg
        className={cn(
          "absolute inset-0 w-full h-full -rotate-90 transition-all duration-1000",
          faceType === 'cosmic' && "filter drop-shadow-[0_0_12px_rgba(139,92,246,0.3)]"
        )}
        viewBox="0 0 320 320"
      >
        <circle
          cx="160"
          cy="160"
          r={radius}
          stroke="currentColor"
          strokeWidth={faceType === 'minimalist' ? "4" : "12"}
          fill="transparent"
          className="text-white/5"
        />
        {/* Progress Ring */}
        <motion.circle
          cx="160"
          cy="160"
          r={radius}
          stroke={faceType === 'minimalist' ? "#64748b" : "url(#timer-gradient)"}
          strokeWidth={faceType === 'minimalist' ? "4" : "12"}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "linear" }}
          strokeLinecap={faceType === 'geometric' ? "butt" : "round"}
          className="relative z-10"
        />
        <defs>
          <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={faceType === 'geometric' ? "#3b82f6" : "#8B5CF6"} />
            <stop offset="100%" stopColor={faceType === 'geometric' ? "#06b6d4" : "#EC4899"} />
          </linearGradient>
        </defs>
      </svg>

      {/* Time Text */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full px-4 overflow-hidden">
        <motion.div
          key={timeString.length} // Animate when string length changes (e.g. adding hours)
          initial={{ opacity: 0.8, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "font-mono font-bold text-foreground tracking-tighter drop-shadow-glow transition-all duration-300",
            getFontSize()
          )}
        >
          {timeString}
        </motion.div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mt-2">
          {mode} mode
        </div>
      </div>

      {/* Subtle Glow */}
      <div className="absolute inset-0 bg-brand-purple/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}


