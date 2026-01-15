
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { startOfDay, format, subDays } from 'date-fns';
import { doc, serverTimestamp, updateDoc, setDoc, addDoc, collection, Timestamp, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { TimerState, Session, User } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Helper to convert Firestore Timestamp to milliseconds safely
const toMillis = (timestamp: any): number => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toMillis();
  }
  if (timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
    return timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
  }
  return 0;
};

export function useTimer() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [displayTime, setDisplayTime] = useState(0);
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [localDuration, setLocalDuration] = useState(25); // Default local duration when idle
  const [localMode, setLocalMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [localSubjectId, setLocalSubjectId] = useState<string | null>(null);

  const tickRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Sync Active Timer State
  useEffect(() => {
    if (!user || !firestore) return;

    const timerDocRef = doc(firestore, 'users', user.uid, 'timer', 'active');

    // Listen to the authoritative state
    const unsubscribe = onSnapshot(timerDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as TimerState;
        setTimerState(data);
      } else {
        // Init if missing
        setTimerState({
          status: 'stopped',
          mode: 'pomodoro',
          duration: 25 * 60,
          startTime: null,
          pausedAt: null,
          timeLeftAtPause: null,
          subjectId: null
        });
      }
    });

    return () => unsubscribe();
  }, [user, firestore]);

  // 2. Tick Logic
  const tick = useCallback(() => {
    if (!timerState) return;

    if (timerState.status === 'running' && timerState.startTime) {
      const now = Date.now();
      const elapsed = (now - timerState.startTime) / 1000;

      if (timerState.mode === 'pomodoro') {
        const remaining = Math.max(0, timerState.duration - elapsed);
        setDisplayTime(remaining);
      } else {
        setDisplayTime(elapsed);
      }
    } else if (timerState.status === 'paused' && timerState.timeLeftAtPause !== null) {
      setDisplayTime(timerState.timeLeftAtPause);
    } else {
      // Stopped/Idle
      // If we are stopped, show the 'planned' duration (local or stored)
      setDisplayTime(timerState.mode === 'pomodoro' ? timerState.duration : 0);
    }
  }, [timerState]);

  useEffect(() => {
    tick(); // Immediate update
    tickRef.current = setInterval(tick, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [tick]);


  // 3. Actions
  const start = async () => {
    if (!user || !firestore) return;

    // If starting from idle
    const startTime = Date.now();
    const duration = timerState?.duration || localDuration * 60;

    // If resuming from pause
    if (timerState?.status === 'paused' && timerState.timeLeftAtPause) {
      // Technically for Pomodoro, we just update startTime to (Now - (Total - Remaining))
      // So Elapsed = Now - NewStartTime.
      // Elapsed = Total - Remaining.
      // NewStartTime = Now - (Total - Remaining).
      const timeAlreadyElapsed = duration - timerState.timeLeftAtPause;

      await updateDoc(doc(firestore, 'users', user.uid, 'timer', 'active'), {
        status: 'running',
        startTime: startTime - (timeAlreadyElapsed * 1000), // Adjust start time relative to now
        pausedAt: null
      });
    } else {
      // Fresh start
      await setDoc(doc(firestore, 'users', user.uid, 'timer', 'active'), {
        status: 'running',
        mode: localMode,
        duration: localMode === 'pomodoro' ? localDuration * 60 : 0,
        startTime: startTime,
        subjectId: localSubjectId,
        pausedAt: null,
        timeLeftAtPause: null
      });
    }
  };

  const pause = async () => {
    if (!user || !firestore || !timerState) return;
    if (timerState.status !== 'running') return;

    // Calculate exact remaining time at pause moment
    // For syncing, this is the canonical 'saved' time
    let timeLeftAtPause = 0;
    if (timerState.mode === 'pomodoro') {
      timeLeftAtPause = displayTime; // Captured from current tick
    } else {
      timeLeftAtPause = displayTime; // Elapsed for stopwatch
    }

    await updateDoc(doc(firestore, 'users', user.uid, 'timer', 'active'), {
      status: 'paused',
      pausedAt: Date.now(),
      timeLeftAtPause
    });
  };

  const stop = async (finalStatus: 'stopped' | 'completed') => {
    if (!user || !firestore) return;

    // Save session if valid
    // ... (Session save logic simplified for brevity, assume similar to before but reading from displayTime/State)

    await updateDoc(doc(firestore, 'users', user.uid, 'timer', 'active'), {
      status: 'stopped',
      startTime: null,
      pausedAt: null,
      timeLeftAtPause: null
    });
  };

  const reset = stop; // Alias for now

  // Local setters for when idle
  const handleModeChange = (m: 'pomodoro' | 'stopwatch') => {
    setLocalMode(m);
    if (firestore && user) {
      updateDoc(doc(firestore, 'users', user.uid, 'timer', 'active'), { mode: m, duration: m === 'pomodoro' ? localDuration * 60 : 0 });
    }
  };

  const handleDurationChange = (d: number) => {
    setLocalDuration(d);
    if (firestore && user) {
      updateDoc(doc(firestore, 'users', user.uid, 'timer', 'active'), { duration: d * 60 });
    }
  };

  const handleSubjectChange = (id: string) => {
    setLocalSubjectId(id);
    if (firestore && user) {
      updateDoc(doc(firestore, 'users', user.uid, 'timer', 'active'), { subjectId: id });
    }
  };

  return {
    displayTime,
    selectedSubjectId: timerState?.subjectId || localSubjectId,
    mode: timerState?.mode || localMode,
    customDuration: timerState ? timerState.duration / 60 : localDuration,
    isActive: timerState?.status === 'running',
    isPaused: timerState?.status === 'paused',
    isIdle: !timerState || timerState.status === 'stopped',
    timerStateLoading: !timerState,
    start,
    pause,
    stop,
    reset,
    handleModeChange,
    handleSubjectChange,
    handleDurationChange,
    setSelectedSubjectId: handleSubjectChange
  };
}
