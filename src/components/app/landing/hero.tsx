"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Chrome, Download, AlertCircle, FileArchive, Settings, FolderInput } from 'lucide-react';
import { InstallPwaButton } from '@/components/app/landing/InstallPwaButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';

const ChromeIcon = Chrome; // Alias if needed or just use Chrome directly

export function Hero() {
    const [showExtensionGuide, setShowExtensionGuide] = useState(false);

    const handleExtensionDownload = (e: React.MouseEvent) => {
        // Allow download to proceed
        // Show guide immediately
        setShowExtensionGuide(true);
    };

    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 px-4 overflow-hidden">
            <div className="container max-w-6xl mx-auto text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-gradient leading-tight lg:leading-[1.1]">
                        MASTER YOUR TIME,<br />
                        <span className="text-white">ELEVATE YOUR FOCUS</span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-sans"
                    >
                        A cosmic-themed study tracker designed to transform your productivity
                        through deep focus and intelligent time management.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <InstallPwaButton />
                    <a
                        href="/fenrir-extension.zip"
                        download
                        onClick={handleExtensionDownload}
                        className="glass px-8 py-4 rounded-2xl border-white/10 hover:bg-white/5 hover:border-brand-purple/50 text-white font-bold transition-all flex items-center gap-3 group cursor-pointer"
                    >
                        <span className="bg-brand-purple/20 p-2 rounded-lg group-hover:bg-brand-purple/40 transition-colors">
                            <ChromeIcon className="w-5 h-5 text-brand-purple" />
                        </span>
                        Download Extension
                    </a>

                    <Dialog open={showExtensionGuide} onOpenChange={setShowExtensionGuide}>
                        <DialogContent className="glass-elevated border-white/10 text-white sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-display font-bold flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-brand-purple" />
                                    One-Time Setup Required
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Due to browser security, developer extensions must be loaded manually.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-sm">1</div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm">Unzip the Downloaded File</p>
                                        <p className="text-xs text-slate-400">Extract <span className="text-brand-purple font-mono">fenrir-extension.zip</span> to a folder.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-sm">2</div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm">Open Extensions Page</p>
                                        <p className="text-xs text-slate-400">Go to <span className="text-brand-purple font-mono bg-white/5 px-1 rounded">chrome://extensions</span> in a new tab.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-sm">3</div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm">Enable Developer Mode</p>
                                        <p className="text-xs text-slate-400">Toggle the switch in the top right corner.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-sm">4</div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm">Load Unpacked</p>
                                        <p className="text-xs text-slate-400">Click "Load Unpacked" button and select your unzipped folder.</p>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16 border-y border-white/5 py-8"
                >
                    <div className="text-center group">
                        <div className="text-3xl md:text-4xl font-mono font-bold text-brand-purple group-hover:scale-110 transition-transform">10K+</div>
                        <div className="text-xs uppercase tracking-widest text-slate-500 mt-1">Total Users</div>
                    </div>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                    <div className="text-center group">
                        <div className="text-3xl md:text-4xl font-mono font-bold text-brand-pink group-hover:scale-110 transition-transform">500K+</div>
                        <div className="text-xs uppercase tracking-widest text-slate-500 mt-1">Study Hours</div>
                    </div>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                    <div className="text-center group">
                        <div className="text-3xl md:text-4xl font-mono font-bold text-brand-cyan group-hover:scale-110 transition-transform">1.2M+</div>
                        <div className="text-xs uppercase tracking-widest text-slate-500 mt-1">Streaks</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
