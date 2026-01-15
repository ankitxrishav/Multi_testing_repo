

export type Subject = {
  id: string;
  userId: string;
  name: string;
  color: string;
  priority?: 'low' | 'medium' | 'high';
  archived: boolean;
  archivedAt?: string; // ISO string when archived
  createdAt: string; // ISO string
};

export type Session = {
  id: string;
  userId: string;
  subjectId: string;
  mode: 'pomodoro' | 'stopwatch';
  startTime: string; // ISO string
  endTime: string; // ISO string
  duration: number; // in seconds
  pauseCount: number;
  status: 'completed' | 'stopped';
  focusScore: number;
};

export type Goal = {
  id: string;
  userId: string;
  type: 'daily' | 'weekly-subject';
  targetMinutes: number;
  subjectId?: string;
};


export type UserSettings = {
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionEndAlert: boolean;
  breakReminder: boolean;
  studyTargetHours: number; // New: Daily study goal (1-12)
  timerFace?: 'cosmic' | 'minimalist' | 'geometric';
};

export type User = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: string;
  settings?: UserSettings;
  streak: number; // Current study target streak
  lastStreakUpdate?: string; // Last date the streak was maintained
  lastLogin?: string;
};

// Represents the state of a user's timer, stored in Firestore
export type TimerState = {
  status: 'running' | 'paused' | 'stopped';
  mode: 'pomodoro' | 'stopwatch';
  subjectId: string | null;
  // Unix timestamp when the timer started running (adjusted for pauses)
  startTime: number | null;
  // Total planned duration in seconds
  duration: number;
  // Unix timestamp when paused
  pausedAt: number | null;
  // Snapshot of remaining time (or elapsed) when paused
  timeLeftAtPause: number | null;
}

