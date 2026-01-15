
"use client";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { useMemo } from "react";
import { Session, Subject } from "@/lib/definitions";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Clock, Book } from "lucide-react";

export function RecentSessions() {
    const { user } = useUser();
    const firestore = useFirestore();

    const sessionsQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, "sessions"),
            where("userId", "==", user.uid),
            orderBy("startTime", "desc"),
            limit(10)
        );
    }, [user, firestore]);

    const { data: sessions, loading } = useCollection<Session>(sessionsQuery);

    const subjectsQuery = useMemo(() => {
        return user && firestore ? query(collection(firestore, 'subjects'), where('userId', '==', user.uid)) : null;
    }, [user, firestore]);
    const { data: subjects } = useCollection<Subject>(subjectsQuery);

    const getSubject = (id: string) => subjects?.find(s => s.id === id);

    if (loading) {
        return <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 glass rounded-2xl animate-pulse" />)}
        </div>;
    }

    if (!sessions?.length) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <Clock className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium uppercase tracking-widest">No recent sessions</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sessions.map((session, idx) => {
                const subject = getSubject(session.subjectId);
                return (
                    <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-2xl glass border-white/5 group hover:glass-elevated transition-all"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg`} style={{ backgroundColor: `${subject?.color || '#8B5CF6'}15`, color: subject?.color || '#8B5CF6' }}>
                            <Book className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <h4 className="font-bold text-white text-sm truncate group-hover:text-brand-purple transition-colors">
                                    {subject?.name || "Deleted Subject"}
                                </h4>
                                <div className="text-[10px] font-mono font-bold text-slate-500 whitespace-nowrap">
                                    {format(new Date(session.startTime), 'MMM d, p')}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-1 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{Math.round(session.duration / 60)} min</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                <span>{session.mode}</span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

