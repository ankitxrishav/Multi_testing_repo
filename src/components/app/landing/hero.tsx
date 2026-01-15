"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Chrome, Download } from 'lucide-react';
import { InstallPwaButton } from '@/components/app/landing/InstallPwaButton';

const ChromeIcon = Chrome; // Alias if needed or just use Chrome directly

export function Hero() {
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
                        className="glass px-8 py-4 rounded-2xl border-white/10 hover:bg-white/5 hover:border-brand-purple/50 text-white font-bold transition-all flex items-center gap-3 group"
                    >
                        <span className="bg-brand-purple/20 p-2 rounded-lg group-hover:bg-brand-purple/40 transition-colors">
                            <ChromeIcon className="w-5 h-5 text-brand-purple" />
                        </span>
                        Download Extension
                    </a>
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
