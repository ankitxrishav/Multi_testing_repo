
"use client";

import { Overview } from "@/components/app/dashboard/overview";
import { RecentSessions } from "@/components/app/dashboard/recent-sessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { Activity, Target, TrendingUp, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { collection, query, where } from "firebase/firestore";
import { Session, User } from "@/lib/definitions";
import { useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { subDays, startOfDay, format } from "date-fns";
import { motion } from "framer-motion";
import { ActivityHeatmap } from "@/components/app/dashboard/heatmap";
import LoadingScreen from "@/components/app/loading-screen";

function formatDuration(seconds: number) {
    if (seconds < 60) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

export default function DashboardPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const userDocRef = useMemo(() => (user && firestore ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const { data: userData } = useDoc<User>(userDocRef);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    const sessionsQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'sessions'),
            where('userId', '==', user.uid)
        );
    }, [user, firestore]);

    const { data: allSessions, loading: sessionsLoading } = useCollection<Session>(sessionsQuery);

    const { todayStats, sevenDaySessions } = useMemo(() => {
        if (!allSessions) return { todayStats: { timeStudied: 0, focusScore: 0 }, sevenDaySessions: [] };

        const todayStart = startOfDay(new Date());
        const sevenDaysAgo = startOfDay(subDays(new Date(), 6));

        const todaySessions = allSessions.filter(s => new Date(s.startTime) >= todayStart);
        const recentSessions = allSessions.filter(s => new Date(s.startTime) >= sevenDaysAgo);

        const timeStudied = todaySessions.reduce((acc, s) => acc + s.duration, 0);

        const validFocusSessions = todaySessions.filter(s => s.focusScore > 0);
        const focusScore = validFocusSessions.length > 0
            ? Math.round(validFocusSessions.reduce((acc, s) => acc + s.focusScore, 0) / validFocusSessions.length)
            : 0;

        return {
            todayStats: { timeStudied, focusScore },
            sevenDaySessions: recentSessions
        };
    }, [allSessions]);

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';

    return (
        <div className="flex-col md:flex min-h-screen">
            <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full">
                {(userLoading || sessionsLoading || !user) ? (
                    <LoadingScreen />
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div className="space-y-1">
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
                                    Good {greeting}, <span className="text-gradient underline decoration-brand-purple/30 underline-offset-8 decoration-4">{user.displayName?.split(' ')[0]}</span> 👋
                                </h1>
                                <p className="text-muted-foreground font-medium">
                                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 glass px-6 py-3 rounded-2xl border-border/50 glow-purple animate-float">
                                <div className="p-2 bg-gradient-cosmic rounded-xl">
                                    <Activity className="h-5 w-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-mono font-bold text-foreground leading-none">{userData?.streak || 0}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Day Streak</div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {[
                                { label: "Today's Focus", value: formatDuration(todayStats.timeStudied), sub: "Total time logged", icon: Zap, color: "brand-purple" },
                                { label: "Focus Score", value: todayStats.focusScore > 0 ? `${todayStats.focusScore}%` : '-', sub: "Avg per session", icon: Activity, color: "brand-pink" },
                                { label: "Daily Progress", value: userData?.settings?.studyTargetHours ? `${Math.min(100, Math.round((todayStats.timeStudied / (userData.settings.studyTargetHours * 3600)) * 100))}%` : '0%', sub: `Goal: ${userData?.settings?.studyTargetHours || 0}h`, icon: Target, color: "brand-cyan" },
                                { label: "Tasks Done", value: "12", sub: "Today's completion", icon: TrendingUp, color: "yellow-400" }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass p-6 rounded-3xl border-border/50 group hover:glass-elevated transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-2.5 rounded-2xl bg-${stat.color}/10 text-${stat.color} group-hover:scale-110 transition-transform`}>
                                            <stat.icon className="h-5 w-5" />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</div>
                                            <div className="text-3xl font-mono font-bold text-foreground mt-1 group-hover:text-gradient transition-all">{stat.value}</div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-border/50 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: stat.value.includes('%') ? stat.value : '60%' }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className={`h-full bg-${stat.color}`}
                                        />
                                    </div>
                                    <div className="mt-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.sub}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Large Charts Row */}
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-7">
                            <Card className="lg:col-span-4 glass-elevated border-border/50 rounded-[32px] overflow-hidden p-6 md:p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-display font-bold uppercase tracking-wider text-foreground flex items-center gap-3">
                                        Study Time Overview
                                        <span className="text-[10px] bg-brand-purple/20 text-brand-purple px-3 py-1 rounded-full border border-brand-purple/30 font-bold">LAST 7 DAYS</span>
                                    </h3>
                                </div>
                                <div className="h-[300px] w-full mt-4">
                                    <Overview sessions={sevenDaySessions} />
                                </div>
                            </Card>

                            <Card className="lg:col-span-3 glass border-border/50 rounded-[32px] overflow-hidden p-6 md:p-8">
                                <h3 className="text-xl font-display font-bold uppercase tracking-wider text-foreground mb-6">Recent Sessions</h3>
                                <div className="h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                                    <RecentSessions />
                                </div>
                            </Card>
                        </div>

                        {/* Heatmap Row */}
                        <div className="grid grid-cols-1 gap-8">
                            <ActivityHeatmap sessions={allSessions || []} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

