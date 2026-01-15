"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Timer, LayoutDashboard, Target, Zap, Shield, Sparkles } from 'lucide-react';

const features = [
    {
        title: "Deep Focus Timer",
        description: "Customizable Pomodoro and Stopwatch modes with immersive cosmic visuals.",
        icon: Timer,
        color: "brand-purple"
    },
    {
        title: "Advanced Analytics",
        description: "Visualize your study patterns with interactive charts and heatmaps.",
        icon: LayoutDashboard,
        color: "brand-pink"
    },
    {
        title: "Goal Tracking",
        description: "Set daily targets and build consistent study habits with streaks.",
        icon: Target,
        color: "brand-cyan"
    },
    {
        title: "Lightning Fast",
        description: "Optimized performance for a smooth and responsive experience.",
        icon: Zap,
        color: "yellow-400"
    },
    {
        title: "Privacy First",
        description: "Your data is secure and private, focused entirely on your growth.",
        icon: Shield,
        color: "green-400"
    },
    {
        title: "Premium Design",
        description: "Award-winning interface designed for minimal distraction and maximum wow.",
        icon: Sparkles,
        color: "brand-purple"
    }
];

export function Features() {
    return (
        <section className="py-24 px-4 relative overflow-hidden">
            <div className="container max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
                        EVERYTHING YOU NEED TO <span className="text-brand-purple">STAY PRODUCTIVE</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Designed for serious students who demand both functionality and aesthetics.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass p-8 rounded-3xl border-white/5 group hover:glass-elevated transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-${feature.color}/10 flex items-center justify-center mb-6 group-hover:glow-purple transition-all`}>
                                <feature.icon className={`w-7 h-7 text-${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 font-display tracking-tight text-white group-hover:text-brand-purple transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
