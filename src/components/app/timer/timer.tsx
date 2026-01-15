
"use client";

import { useState, useMemo } from 'react';
import { useTimer } from '@/hooks/use-timer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddSubjectDialog } from './add-subject-dialog';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { addDoc, collection, query, serverTimestamp, where, doc } from 'firebase/firestore';
import { useDoc } from '@/firebase';
import { Input } from '@/components/ui/input';
import type { Subject, User } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { TimerDisplay } from './timer-display';
import { TimerControls } from './timer-controls';
import { Card, CardContent } from '@/components/ui/card';

const modeSettings: { [key in 'pomodoro' | 'stopwatch']: { label: string } } = {
  pomodoro: { label: 'Pomodoro' },
  stopwatch: { label: 'Stopwatch' },
};

export default function Timer() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isAddSubjectOpen, setAddSubjectOpen] = useState(false);

  const subjectsQuery = useMemo(() => {
    return user && firestore ? query(collection(firestore, 'subjects'), where('userId', '==', user.uid), where('archived', '==', false)) : null;
  }, [user, firestore]);
  const { data: subjects, loading: subjectsLoading } = useCollection<Subject>(subjectsQuery);

  const {
    displayTime,
    selectedSubjectId,
    mode,
    customDuration,
    isActive,
    isPaused,
    isIdle,
    start,
    pause,
    stop,
    reset,
    handleModeChange,
    handleSubjectChange,
    handleDurationChange,
    setSelectedSubjectId
  } = useTimer();

  const userDocRef = useMemo(() => (user && firestore ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
  const { data: userData } = useDoc<User>(userDocRef);

  const selectedSubject = useMemo(() => {
    if (!subjects || !selectedSubjectId) return null;
    return subjects.find(s => s.id === selectedSubjectId) || null;
  }, [subjects, selectedSubjectId]);

  const handleAddSubject = async (newSubject: Omit<Subject, 'id' | 'archived' | 'userId' | 'createdAt'>) => {
    if (!user) {
      toast({
        title: 'Please Log In',
        description: 'You need to be logged in to add subjects.',
        action: <Button onClick={() => router.push('/login')}>Login</Button>
      });
      return;
    }
    if (!firestore) return;

    try {
      const docRef = await addDoc(collection(firestore, "subjects"), {
        ...newSubject,
        userId: user.uid,
        archived: false,
        createdAt: serverTimestamp()
      });
      setSelectedSubjectId(docRef.id);
      setAddSubjectOpen(false);
    } catch (e) {
      console.error("Error adding document: ", e);
      toast({
        title: 'Error',
        description: 'Could not add subject.',
        variant: 'destructive'
      })
    }
  };

  const isBreakMode = false; // Placeholder for break logic if available

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-[480px] px-4">
        <Card className={cn(
          "glass-elevated border-border/50 overflow-hidden transition-all duration-700 shadow-glow-purple",
          isBreakMode && "border-brand-cyan/20 shadow-[0_0_24px_rgba(6,182,212,0.2)]"
        )}>
          <CardContent className="p-6 md:p-8 flex flex-col items-center gap-6 md:gap-8">

            <Tabs
              value={mode}
              onValueChange={(val) => handleModeChange(val as 'pomodoro' | 'stopwatch')}
              className="w-full"
            >
              <TabsList className={cn(
                "grid w-full grid-cols-2 glass p-1 h-14 rounded-2xl border-border/50 transition-all",
                !isIdle && "opacity-50 pointer-events-none"
              )}>
                <TabsTrigger
                  value="pomodoro"
                  className="rounded-xl data-[state=active]:bg-gradient-cosmic data-[state=active]:text-white font-bold h-full transition-all duration-500"
                >
                  Pomodoro
                </TabsTrigger>
                <TabsTrigger
                  value="stopwatch"
                  className="rounded-xl data-[state=active]:bg-gradient-cosmic data-[state=active]:text-white font-bold h-full transition-all duration-500"
                >
                  Stopwatch
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <TimerDisplay
              time={displayTime}
              initialDuration={mode === 'pomodoro' ? customDuration * 60 : 0}
              mode={mode}
              faceType={userData?.settings?.timerFace || 'cosmic'}
            />

            <div className="w-full space-y-6">
              <div className="flex gap-2 items-center">
                <Select onValueChange={handleSubjectChange} disabled={!isIdle || !user} value={selectedSubjectId || ""}>
                  <SelectTrigger className="glass h-12 rounded-2xl border-border/50 text-foreground transition-all focus:ring-brand-purple/20">
                    <SelectValue placeholder={user ? (subjectsLoading ? "Loading..." : "Select subject") : "Login to select subject"} />
                  </SelectTrigger>
                  <SelectContent className="glass-elevated border-border/50 text-foreground">
                    {user && subjects && subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id} className="focus:bg-brand-purple/20 focus:text-foreground rounded-lg px-3 mb-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="h-3 w-3 rounded-full glow-purple shadow-[0_0_8px_currentColor]" style={{ backgroundColor: subject.color }}></span>
                          <span className="font-medium">{subject.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAddSubjectOpen(true)}
                  disabled={!isIdle}
                  className="glass h-12 w-12 rounded-2xl border-border/50 flex-shrink-0 hover:bg-white/5 hover:text-foreground transition-all group"
                >
                  <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />
                </Button>
              </div>

              <div className="flex items-center justify-between px-2">
                <div className="flex flex-wrap gap-2">
                  {[25, 15, 45, 5].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleDurationChange(preset)}
                      disabled={!isIdle || mode !== 'pomodoro'}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest glass border-white/5 hover:border-brand-purple/30 transition-all hover:scale-105 active:scale-95",
                        customDuration === preset && mode === 'pomodoro' && "bg-brand-purple/20 border-brand-purple/40 text-brand-purple"
                      )}
                    >
                      {preset} min
                    </button>
                  ))}
                </div>

                {mode === 'pomodoro' && (
                  <div className='flex items-center gap-3 glass px-3 py-1.5 rounded-2xl border-border/50'>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Min</span>
                    <input
                      type="number"
                      value={customDuration}
                      onChange={(e) => handleDurationChange(Number(e.target.value))}
                      className="w-8 bg-transparent border-0 font-mono font-bold text-sm text-center text-foreground focus:ring-0 focus:outline-none p-0"
                      disabled={!isIdle}
                    />
                  </div>
                )}
              </div>
            </div>

            <TimerControls
              isActive={isActive}
              isPaused={isPaused}
              onStart={start}
              onPause={pause}
              onStop={() => stop('stopped')}
              onReset={reset}
              modeColor={isBreakMode ? "brand-cyan" : "brand-purple"}
            />
          </CardContent>
        </Card>
      </div>
      <AddSubjectDialog
        isOpen={isAddSubjectOpen}
        onOpenChange={setAddSubjectOpen}
        onAddSubject={handleAddSubject}
      />
    </div>
  );
}

