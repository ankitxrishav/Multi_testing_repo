"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser, useCollection, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { collection, query, where, doc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { Subject } from "@/lib/definitions";
import LoadingScreen from "@/components/app/loading-screen";
import { motion } from "framer-motion";
import { Book, Archive, MoreVertical, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddSubjectDialog } from "@/components/app/timer/add-subject-dialog";
import { EditSubjectDialog } from "@/components/app/timer/edit-subject-dialog";

export default function SubjectsPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const [isAddSubjectOpen, setAddSubjectOpen] = useState(false);
    const [isEditSubjectOpen, setEditSubjectOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

    const subjectsQuery = useMemo(() => user && firestore ? query(collection(firestore, 'subjects'), where('userId', '==', user.uid)) : null, [user, firestore]);
    const { data: subjects, loading: subjectsLoading } = useCollection<Subject>(subjectsQuery);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    const handleAddSubject = async (newSubject: Omit<Subject, 'id' | 'archived' | 'userId' | 'createdAt'>) => {
        if (!user || !firestore) return;
        try {
            await addDoc(collection(firestore, "subjects"), {
                ...newSubject,
                userId: user.uid,
                archived: false,
                createdAt: serverTimestamp(),
            });
            setAddSubjectOpen(false);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    const handleEditSubject = (subject: Subject) => {
        setEditingSubject(subject);
        setEditSubjectOpen(true);
    };

    const handleUpdateSubject = async (subjectId: string, updates: Partial<Subject>) => {
        if (!firestore) return;
        try {
            const subjectRef = doc(firestore, "subjects", subjectId);
            await updateDoc(subjectRef, updates);
            setEditSubjectOpen(false);
            setEditingSubject(null);
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    };

    const toggleArchive = async (subject: Subject) => {
        if (!firestore) return;
        const subjectRef = doc(firestore, "subjects", subject.id);
        const isArchiving = !subject.archived;
        await updateDoc(subjectRef, {
            archived: isArchiving,
            archivedAt: isArchiving ? new Date().toISOString() : null
        });
    };

    // Auto-deletion logic for subjects archived > 24 hours
    useEffect(() => {
        if (!subjects || !firestore) return;

        const cleanupArchivedSubjects = async () => {
            const now = new Date().getTime();
            const deletedIds: string[] = [];

            for (const subject of subjects) {
                if (subject.archived && subject.archivedAt) {
                    const archivedDate = new Date(subject.archivedAt).getTime();
                    const hoursSinceArchived = (now - archivedDate) / (1000 * 60 * 60);

                    if (hoursSinceArchived >= 24) {
                        try {
                            const { deleteDoc } = await import("firebase/firestore");
                            await deleteDoc(doc(firestore, "subjects", subject.id));
                            deletedIds.push(subject.id);
                        } catch (e) {
                            console.error("Failed to auto-delete subject:", subject.id, e);
                        }
                    }
                }
            }

            if (deletedIds.length > 0) {
                console.log(`Cleaned up ${deletedIds.length} archived subjects older than 24h.`);
            }
        };

        cleanupArchivedSubjects();
    }, [subjects, firestore]);

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-12 mb-20 md:mb-0">
            {(userLoading || subjectsLoading || !user) ? (
                <LoadingScreen />
            ) : (
                <>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
                                STUDY <span className="text-gradient">SUBJECTS</span>
                            </h1>
                            <p className="text-slate-500 font-medium">Manage your academic focus areas and track your dedication.</p>
                        </div>

                        <Button
                            onClick={() => setAddSubjectOpen(true)}
                            className="h-14 px-8 rounded-2xl bg-gradient-cosmic hover:glow-purple text-lg font-bold transition-all duration-500 group"
                        >
                            <PlusCircle className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
                            ADD SUBJECT
                        </Button>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects && subjects.length > 0 ? subjects.map((subject, idx) => (
                            <motion.div
                                key={subject.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: (idx % 10) * 0.05 }}
                                className="group relative"
                            >
                                <div className={cn(
                                    "glass-elevated p-8 rounded-[32px] border-white/5 transition-all duration-500 group-hover:-translate-y-2 group-hover:border-white/10 overflow-hidden h-full flex flex-col justify-between",
                                    subject.archived && "opacity-60 grayscale-[0.5]"
                                )}>
                                    <div>
                                        {/* Top Controls */}
                                        <div className="flex items-start justify-between mb-8">
                                            <div
                                                className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:glow-purple transition-all duration-500"
                                                style={{ backgroundColor: `${subject.color}20` }}
                                            >
                                                <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white/40 to-transparent" />
                                                <Book className="h-8 w-8 relative z-10" style={{ color: subject.color }} />
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl glass border-white/5 hover:bg-white/10 transition-all">
                                                        <MoreVertical className="h-5 w-5 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="glass-elevated border-white/10 rounded-2xl p-2 min-w-[160px]">
                                                    <DropdownMenuItem
                                                        onClick={() => handleEditSubject(subject)}
                                                        className="rounded-xl focus:bg-brand-purple/20 focus:text-white cursor-pointer py-3"
                                                    >
                                                        Edit Subject
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => toggleArchive(subject)}
                                                        className="rounded-xl focus:bg-brand-purple/20 focus:text-white cursor-pointer py-3"
                                                    >
                                                        {subject.archived ? 'Unarchive' : 'Archive'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-gradient transition-all truncate">
                                                    {subject.name}
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <Badge className={cn(
                                                        "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest border-0",
                                                        subject.archived ? "bg-slate-800 text-slate-400" : "bg-brand-purple/20 text-brand-purple border border-brand-purple/30"
                                                    )}>
                                                        {subject.archived ? 'Archived' : 'Active'}
                                                    </Badge>
                                                    {subject.priority && (
                                                        <Badge className="bg-white/5 text-slate-400 border-white/5 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                                                            {subject.priority} PRIORITY
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 grid grid-cols-2 gap-4 border-t border-white/5 mt-auto">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sessions</div>
                                            <div className="text-xl font-mono font-bold text-foreground">124</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Focus Time</div>
                                            <div className="text-xl font-mono font-bold text-foreground">48<span className="text-xs text-muted-foreground ml-1">H</span></div>
                                        </div>
                                    </div>

                                    {/* Bottom Decorative Edge */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-500 group-hover:h-2"
                                        style={{ backgroundColor: subject.color }}
                                    />
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-24 flex flex-col items-center justify-center glass rounded-[40px] border-dashed border-white/10">
                                <Archive className="w-16 h-16 text-slate-800 mb-4" />
                                <p className="text-slate-500 font-medium text-lg">No focus areas identified yet.</p>
                                <Button variant="link" onClick={() => setAddSubjectOpen(true)} className="text-brand-purple mt-2 text-lg">Initialize your first subject</Button>
                            </div>
                        )}
                    </div>
                </>
            )}

            <AddSubjectDialog
                isOpen={isAddSubjectOpen}
                onOpenChange={setAddSubjectOpen}
                onAddSubject={handleAddSubject}
            />
            <EditSubjectDialog
                isOpen={isEditSubjectOpen}
                onOpenChange={setEditSubjectOpen}
                onUpdateSubject={handleUpdateSubject}
                subject={editingSubject}
            />
        </div>
    );
}

