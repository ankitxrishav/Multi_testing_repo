"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser, useCollection, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Subject, Session } from "@/lib/definitions";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import LoadingScreen from "@/components/app/loading-screen";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, Activity, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

export default function HistoryPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    const subjectsQuery = useMemo(() => user && firestore ? query(collection(firestore, 'subjects'), where('userId', '==', user.uid)) : null, [user, firestore]);
    const { data: subjects, loading: subjectsLoading } = useCollection<Subject>(subjectsQuery);

    const sessionsQuery = useMemo(() => user && firestore ? query(collection(firestore, 'sessions'), where('userId', '==', user.uid), orderBy('startTime', 'desc')) : null, [user, firestore]);
    const { data: sessions, loading: sessionsLoading } = useCollection<Session>(sessionsQuery);

    const subjectsMap = useMemo(() => {
        if (!subjects) return new Map<string, Subject>();
        return new Map(subjects.map(s => [s.id, s]));
    }, [subjects]);

    // Grouping sessions by date
    const groupedSessions = useMemo(() => {
        if (!sessions) return [];
        const groups: { date: string, label: string, sessions: Session[] }[] = [];

        sessions.forEach(session => {
            const dateObj = new Date(session.startTime);
            const dateStr = format(dateObj, 'yyyy-MM-dd');
            let label = format(dateObj, 'MMMM d, yyyy');
            if (isToday(dateObj)) label = "Today";
            else if (isYesterday(dateObj)) label = "Yesterday";

            const existingGroup = groups.find(g => g.date === dateStr);
            if (existingGroup) {
                existingGroup.sessions.push(session);
            } else {
                groups.push({ date: dateStr, label, sessions: [session] });
            }
        });
        return groups;
    }, [sessions]);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    return (
        <div className="min-h-screen p-8 max-w-5xl mx-auto space-y-12 mb-20 md:mb-0">
            {(userLoading || subjectsLoading || sessionsLoading || !user) ? (
                <LoadingScreen />
            ) : (
                <>
                    {/* Header */}
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
                            SESSION <span className="text-gradient">HISTORY</span>
                        </h1>
                        <p className="text-slate-500 font-medium">A chronological record of your scholarly pursuits and focus sessions.</p>
                    </div>

                    <div className="space-y-12">
                        {groupedSessions.length > 0 ? (
                            groupedSessions.map((group, groupIdx) => (
                                <HistoryGroup
                                    key={group.date}
                                    group={group}
                                    subjectsMap={subjectsMap}
                                    isDefaultOpen={groupIdx === 0}
                                />
                            ))
                        ) : (
                            <div className="py-24 flex flex-col items-center justify-center glass rounded-[40px] border-dashed border-white/10 mx-8">
                                <Clock className="w-16 h-16 text-slate-800 mb-4" />
                                <p className="text-slate-500 font-medium text-lg">Your study journey begins here.</p>
                                <Button variant="link" onClick={() => router.push('/')} className="text-brand-purple mt-2 text-lg">Start your first session</Button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function HistoryGroup({ group, subjectsMap, isDefaultOpen }: { group: { date: string, label: string, sessions: Session[] }, subjectsMap: Map<string, Subject>, isDefaultOpen: boolean }) {
    const [isOpen, setIsOpen] = useState(isDefaultOpen);

    return (
        <div className="space-y-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-4 group w-full text-left"
            >
                <div className="h-px flex-1 bg-white/5 group-hover:bg-brand-purple/20 transition-colors" />
                <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border-white/5 group-hover:border-brand-purple/20 transition-all">
                    {isOpen ? <ChevronDown className="w-4 h-4 text-brand-purple" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    <span className={cn("text-sm font-bold tracking-widest uppercase", isOpen ? "text-foreground" : "text-muted-foreground")}>
                        {group.label}
                    </span>
                    <Badge variant="outline" className="ml-2 border-white/5 text-slate-500 font-mono text-[10px]">
                        {group.sessions.length}
                    </Badge>
                </div>
                <div className="h-px flex-1 bg-white/5 group-hover:bg-brand-purple/20 transition-colors" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                    >
                        <div className="grid grid-cols-1 gap-4">
                            {group.sessions.map((session: Session, idx: number) => {
                                const subject = subjectsMap.get(session.subjectId);
                                return (
                                    <motion.div
                                        key={session.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (idx % 10) * 0.03 }}
                                        className="group relative"
                                    >
                                        <div className="glass-elevated p-5 rounded-[24px] border-white/5 transition-all duration-300 hover:scale-[1.01] hover:border-white/10 hover:glow-purple">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center p-2 flex-shrink-0"
                                                        style={{ backgroundColor: `${subject?.color || '#8B5CF6'}15` }}
                                                    >
                                                        <Activity className="w-full h-full" style={{ color: subject?.color || '#8B5CF6' }} />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h3 className="font-bold text-foreground group-hover:text-gradient truncate">{subject?.name || 'Deleted Subject'}</h3>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{session.mode}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                            <span className="text-[10px] font-bold text-slate-500">{format(new Date(session.startTime), 'p')}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between md:justify-end gap-6">
                                                    <div className="text-right">
                                                        <div className="text-lg font-mono font-bold text-foreground leading-none">{formatDuration(session.duration)}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {session.focusScore > 0 && (
                                                            <Badge className="bg-brand-purple/20 text-brand-purple border-brand-purple/30 rounded-full px-2 py-0 text-[10px] font-bold">
                                                                {session.focusScore}%
                                                            </Badge>
                                                        )}
                                                        <Badge className="bg-white/5 text-slate-400 border-white/5 rounded-full px-2 py-0 text-[10px] font-bold uppercase">
                                                            {session.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
