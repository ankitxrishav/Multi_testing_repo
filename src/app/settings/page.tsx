"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download, Loader2, Settings, Bell, Database, User as UserIcon, Shield, Sliders } from "lucide-react";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { useRouter } from "next/navigation";
import { doc, updateDoc, collection, query, where } from "firebase/firestore";
import { User, UserSettings, Session } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import LoadingScreen from "@/components/app/loading-screen";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SECTIONS = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Privacy', icon: Database },
];

export default function SettingsPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [activeSection, setActiveSection] = useState('general');

    const userDocRef = useMemo(() => (user && firestore ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const { data: userData, loading: docLoading } = useDoc<User>(userDocRef);

    const sessionsQuery = useMemo(() => (user && firestore ? query(collection(firestore, 'sessions'), where('userId', '==', user.uid)) : null), [user, firestore]);
    const { data: sessions } = useCollection<Session>(sessionsQuery);

    const [settings, setSettings] = useState<UserSettings>({
        pomodoroDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionEndAlert: true,
        breakReminder: true,
        studyTargetHours: 2,
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    useEffect(() => {
        if (userData?.settings) {
            setSettings(userData.settings);
        }
    }, [userData]);

    const handleSaveChanges = async () => {
        if (!userDocRef) return;
        setIsSaving(true);
        try {
            await updateDoc(userDocRef, { settings });
            toast({
                title: "Settings saved",
                description: "Your cosmic preferences have been synchronized.",
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                title: "Error",
                description: "The void swallowed your settings. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    const exportData = (format: 'csv' | 'json') => {
        if (!sessions || sessions.length === 0) {
            toast({
                title: "No data to export",
                description: "You haven't recorded any sessions in the void yet.",
                variant: "destructive",
            });
            return;
        }

        let content = "";
        let fileName = `fenrir-study-export-${new Date().toISOString().split('T')[0]}`;
        let mimeType = "";

        if (format === 'json') {
            content = JSON.stringify(sessions, null, 2);
            fileName += ".json";
            mimeType = "application/json";
        } else {
            const headers = "id,subjectId,mode,startTime,endTime,duration,status,focusScore\n";
            const rows = sessions.map(s =>
                `${s.id},${s.subjectId},${s.mode},${s.startTime},${s.endTime},${s.duration},${s.status},${s.focusScore}`
            ).join('\n');
            content = headers + rows;
            fileName += ".csv";
            mimeType = "text/csv";
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
            title: "Export successful",
            description: `Your celestial data is ready as ${format.toUpperCase()}.`,
        });
    }

    if (userLoading || docLoading || !user) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen p-8 max-w-6xl mx-auto space-y-12 mb-20 md:mb-0">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
                    SYSTEM <span className="text-gradient">SETTINGS</span>
                </h1>
                <p className="text-muted-foreground font-medium">Fine-tune your focus parameters and data synchronization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-start">
                {/* Sidebar Navigation */}
                <aside className="space-y-2">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 relative group",
                                activeSection === section.id
                                    ? "bg-brand-purple/10 text-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            {activeSection === section.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-brand-purple/10 rounded-2xl border border-brand-purple/20"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <section.icon className={cn(
                                "w-6 h-6 relative z-10 transition-colors duration-300",
                                activeSection === section.id ? "text-brand-purple" : "text-slate-500 group-hover:text-slate-300"
                            )} />
                            <span className="relative z-10">{section.label}</span>
                        </button>
                    ))}

                    <div className="pt-8 px-6">
                        <div className="p-4 rounded-2xl glass border-white/5 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-cosmic p-0.5">
                                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-foreground" />
                                    </div>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-foreground truncate">{user.displayName || 'Astronaut'}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono tracking-tighter truncate">{user.email}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full justify-start h-9 px-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-bold"
                                onClick={() => router.push('/logout')}
                            >
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="glass-elevated rounded-[40px] p-8 md:p-12 border border-border/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 blur-[100px] -z-10 rounded-full" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-cyan/5 blur-[100px] -z-10 rounded-full" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-12"
                        >
                            {activeSection === 'general' && (
                                <section className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-display font-bold text-white">Timer Configuration</h2>
                                        <p className="text-slate-500 text-sm">Optimize your deep work and recovery cycles.</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="pomodoro" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pomodoro Interval</Label>
                                            <div className="relative">
                                                <Input
                                                    id="pomodoro"
                                                    type="number"
                                                    value={settings.pomodoroDuration}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, pomodoroDuration: parseInt(e.target.value) || 0 })}
                                                    className="h-14 bg-background border-border/50 rounded-2xl focus:ring-brand-purple focus:border-brand-purple pl-6 font-bold text-lg text-foreground"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">MIN</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="short-break" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Short Break</Label>
                                            <div className="relative">
                                                <Input
                                                    id="short-break"
                                                    type="number"
                                                    value={settings.shortBreakDuration}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, shortBreakDuration: parseInt(e.target.value) || 0 })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-brand-purple focus:border-brand-purple pl-6 font-bold text-lg"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 uppercase">MIN</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="long-break" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Long Break</Label>
                                            <div className="relative">
                                                <Input
                                                    id="long-break"
                                                    type="number"
                                                    value={settings.longBreakDuration}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 0 })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-brand-purple focus:border-brand-purple pl-6 font-bold text-lg"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 uppercase">MIN</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chronograph Interface (Faces)</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {['cosmic', 'minimalist', 'geometric'].map((face) => (
                                                <button
                                                    key={face}
                                                    onClick={() => setSettings({ ...settings, timerFace: face as any })}
                                                    className={cn(
                                                        "p-4 rounded-2xl border-2 transition-all text-center capitalize font-bold",
                                                        settings.timerFace === face
                                                            ? "bg-brand-purple/20 border-brand-purple text-white glow-purple"
                                                            : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20"
                                                    )}
                                                >
                                                    {face}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            onClick={handleSaveChanges}
                                            disabled={isSaving}
                                            className="h-14 px-10 rounded-2xl bg-gradient-cosmic hover:glow-purple text-lg font-bold transition-all duration-500 disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "SYCHRONIZE PREFERENCES"}
                                        </Button>
                                    </div>
                                </section>
                            )}

                            {activeSection === 'notifications' && (
                                <section className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-display font-bold text-white">Relay Settings</h2>
                                        <p className="text-slate-500 text-sm">Control how information is echoed through your workspace.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-6 rounded-3xl glass border-white/5 hover:border-white/10 transition-all">
                                            <div className="space-y-1">
                                                <Label className="text-lg font-bold text-foreground">Session End Pulse</Label>
                                                <p className="text-sm text-muted-foreground">Emit a cosmic vibration when your focus interval completes.</p>
                                            </div>
                                            <Switch
                                                checked={settings.sessionEndAlert}
                                                onCheckedChange={(checked: boolean) => setSettings({ ...settings, sessionEndAlert: checked })}
                                                className="data-[state=checked]:bg-brand-purple"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-6 rounded-3xl glass border-white/5 hover:border-white/10 transition-all">
                                            <div className="space-y-1">
                                                <Label className="text-lg font-bold text-white">Recovery Reminder</Label>
                                                <p className="text-sm text-slate-500">Alert when your recovery phase is over and focus must resume.</p>
                                            </div>
                                            <Switch
                                                checked={settings.breakReminder}
                                                onCheckedChange={(checked: boolean) => setSettings({ ...settings, breakReminder: checked })}
                                                className="data-[state=checked]:bg-brand-purple"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            onClick={handleSaveChanges}
                                            disabled={isSaving}
                                            className="h-14 px-10 rounded-2xl bg-gradient-cosmic hover:glow-purple text-lg font-bold transition-all duration-500 disabled:opacity-50"
                                        >
                                            UPDATE RELAYS
                                        </Button>
                                    </div>
                                </section>
                            )}

                            {activeSection === 'data' && (
                                <section className="space-y-10">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-display font-bold text-white">Celestial Archive</h2>
                                        <p className="text-slate-500 text-sm">Extract and port your scholarly history to external habitats.</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div
                                            onClick={() => exportData('csv')}
                                            className="group cursor-pointer p-8 rounded-3xl glass border-white/5 hover:border-brand-purple/30 hover:bg-brand-purple/5 transition-all duration-500"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:glow-purple transition-all">
                                                <Download className="w-6 h-6 text-slate-400 group-hover:text-brand-purple" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">Export CSV</h3>
                                            <p className="text-sm text-slate-500">Raw tabular data suitable for spreadsheet analysis.</p>
                                        </div>
                                        <div
                                            onClick={() => exportData('json')}
                                            className="group cursor-pointer p-8 rounded-3xl glass border-white/5 hover:border-brand-cyan/30 hover:bg-brand-cyan/5 transition-all duration-500"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:glow-cyan transition-all">
                                                <Download className="w-6 h-6 text-slate-400 group-hover:text-brand-cyan" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">Export JSON</h3>
                                            <p className="text-sm text-slate-500">Universal data format for programmatic integration.</p>
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-[32px] bg-red-500/5 border border-red-500/10 space-y-4">
                                        <div className="flex items-center gap-3 text-red-500">
                                            <Shield className="w-5 h-5" />
                                            <h3 className="font-bold uppercase tracking-widest text-[10px]">Critical Zone</h3>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <p className="font-bold text-white">Purge Subjective History</p>
                                                <p className="text-sm text-slate-500">Irreversibly erase all your recorded study metrics.</p>
                                            </div>
                                            <AlertButton />
                                        </div>
                                    </div>
                                </section>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

function AlertButton() {
    return (
        <Button variant="outline" className="h-12 px-6 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400 font-bold transition-all">
            DELETE DATA
        </Button>
    )
}
