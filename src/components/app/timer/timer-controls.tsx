
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimerControlsProps {
  isActive: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  modeColor?: string;
}

export function TimerControls({
  isActive,
  isPaused,
  onStart,
  onPause,
  onStop,
  onReset,
  modeColor = "brand-purple"
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-8 py-4">
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-2xl glass border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-all shadow-level-1"
          onClick={onReset}
          aria-label="Reset Timer"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        {!isActive || isPaused ? (
          <Button
            size="lg"
            className="h-24 w-24 rounded-[32px] bg-gradient-cosmic glow-purple border-0 shadow-level-3 relative overflow-hidden group"
            onClick={onStart}
            aria-label="Start or Resume Timer"
          >
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
            <Play className="h-10 w-10 fill-white relative z-10 ml-1" />
          </Button>
        ) : (
          <Button
            size="lg"
            className={`h-24 w-24 rounded-[32px] glass-elevated border-white/20 shadow-level-3 text-${modeColor} relative overflow-hidden group`}
            onClick={onPause}
            aria-label="Pause Timer"
          >
            <div className={`absolute inset-0 bg-${modeColor}/5 group-hover:bg-${modeColor}/10 transition-colors`} />
            <Pause className="h-10 w-10 fill-current relative z-10" />
          </Button>
        )}
      </motion.div>

      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="destructive"
          size="icon"
          className="h-14 w-14 rounded-2xl glass-elevated border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all shadow-level-1"
          onClick={onStop}
          aria-label="Stop Timer"
        >
          <Square className="h-6 w-6 fill-current" />
        </Button>
      </motion.div>
    </div>
  );
}

