
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, updateDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { User, Session } from '@/lib/definitions';
import { startOfDay, format, subDays } from 'date-fns';
import { Flame, Target, CheckCircle2, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import LoadingScreen from "@/components/app/loading-screen";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function GoalsPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    // Fetch User Doc for settings and streak
    const userDocRef = useMemo(() => (user && firestore ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const { data: userData, loading: docLoading } = useDoc<User>(userDocRef);

    // Fetch Today's Sessions to calculate study time
    const sessionsQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'sessions'),
            where('userId', '==', user.uid)
        );
    }, [user, firestore]);
    const { data: allSessions } = useCollection<Session>(sessionsQuery);

    const todayStudySeconds = useMemo(() => {
        if (!allSessions) return 0;
        const todayStart = startOfDay(new Date());
        return allSessions
            .filter(s => new Date(s.startTime) >= todayStart)
            .reduce((acc, s) => acc + s.duration, 0);
    }, [allSessions]);

    const [studyTarget, setStudyTarget] = useState(2);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (userData?.settings?.studyTargetHours) {
            setStudyTarget(userData.settings.studyTargetHours);
        }
    }, [userData]);

    const handleSaveTarget = async () => {
        if (!userDocRef || !userData) return;
        setIsSaving(true);
        try {
            await updateDoc(userDocRef, {
                'settings.studyTargetHours': studyTarget
            });
            toast({ title: "Target Saved", description: `Your daily study goal is now ${studyTarget} hours.` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to save study target.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const studyProgress = Math.min(100, (todayStudySeconds / (studyTarget * 3600)) * 100);

    return (
        <div className="min-h-screen p-8 max-w-5xl mx-auto space-y-12">
            {(userLoading || docLoading || !user) ? (
                <LoadingScreen />
            ) : (
                <>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                            YOUR <span className="text-gradient">STUDY GOALS</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Configure your daily targets and build long-term consistency.</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-5">
                        {/* Study Target Section */}
                        <motion.div
                            className="md:col-span-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card className="glass-elevated border-white/5 rounded-[32px] overflow-hidden p-8 flex flex-col h-full">
                                <CardHeader className="p-0 mb-8">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-brand-purple/20 text-brand-purple rounded-2xl">
                                            <Target className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-display font-bold text-white uppercase tracking-wider">DAILY TARGET</CardTitle>
                                            <CardDescription className="text-slate-500 font-medium font-sans">Set a goal between 2 and 18 hours.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 space-y-10 flex-1">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Current Goal</span>
                                                <div className="text-5xl font-mono font-bold text-white">
                                                    {studyTarget} <span className="text-xl text-brand-purple">HRS</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Logged Today</span>
                                                <div className="text-2xl font-mono font-bold text-slate-300">{Math.round(todayStudySeconds / 60)} <span className="text-xs">MIN</span></div>
                                            </div>
                                        </div>

                                        <div className="py-4">
                                            <Slider
                                                value={[studyTarget]}
                                                onValueChange={(val) => setStudyTarget(val[0])}
                                                min={2}
                                                max={18}
                                                step={0.5}
                                                className="relative flex items-center select-none touch-none w-full h-5"
                                            />
                                            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                                <span>2 HRS</span>
                                                <span>18 HRS</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Progress to Goal</span>
                                                <span className="text-sm font-mono font-bold text-brand-purple">{Math.round(studyProgress)}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                                <motion.div
                                                    className="h-full bg-gradient-cosmic rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${studyProgress}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-0 mt-10">
                                    <Button
                                        onClick={handleSaveTarget}
                                        disabled={isSaving}
                                        className="w-full h-14 rounded-2xl bg-gradient-cosmic hover:glow-purple text-lg font-bold transition-all duration-500 group"
                                    >
                                        {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "UPDATE GOAL"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>

                        {/* Streak Card */}
                        <motion.div
                            className="md:col-span-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="glass border-white/5 rounded-[32px] overflow-hidden p-8 flex flex-col justify-center text-center h-full group hover:glass-elevated transition-colors duration-500">
                                <CardContent className="p-0">
                                    <div className="inline-flex items-center justify-center p-6 rounded-[32px] bg-brand-purple/10 text-brand-purple mb-8 group-hover:glow-purple transition-all duration-500 animate-float">
                                        <Flame className="h-16 w-16 fill-current" />
                                    </div>
                                    <div className="text-7xl font-mono font-bold text-white mb-2 leading-none">{userData?.streak || 0}</div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em]">Day Streak</div>
                                    <p className="mt-8 text-sm text-slate-400 font-medium leading-relaxed italic opacity-60">
                                        "Discipline is the bridge between goals and accomplishment."
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    );
}

