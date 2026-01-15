"use client";

import Timer from '@/components/app/timer/timer';
import { Hero } from '@/components/app/landing/hero';
import { Features } from '@/components/app/landing/features';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useUser } from '@/firebase';
import LoadingScreen from '@/components/app/loading-screen';

export default function Home() {
  const { user, loading } = useUser();

  if (loading) return <LoadingScreen />;

  if (user) {
    const firstName = user.displayName?.split(' ')[0]?.toUpperCase() || 'SCHOLAR';

    return (
      <div className="flex flex-col w-full h-[calc(100vh-64px)] justify-center items-center p-4 overflow-hidden">
        <div className="max-w-4xl w-full flex flex-col items-center space-y-4 md:space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-none">
              WELCOME BACK, <span className="text-gradient">{firstName}</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs md:text-sm flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-purple" />
              Your cosmic journey continues.
            </p>
          </div>

          <div className="relative flex justify-center scale-90 md:scale-95 lg:scale-100 origin-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-brand-purple/10 blur-[100px] md:blur-[140px] rounded-full pointer-events-none -z-10" />
            <Timer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Hero />

      <section className="py-12 flex items-center justify-center px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-purple/20 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="relative z-10 w-full flex justify-center">
          <Timer />
        </div>
      </section>

      <Features />

      <section className="py-24 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="glass-elevated p-12 rounded-[40px] text-center space-y-8 border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/20 via-transparent to-brand-pink/20 opacity-50" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">
                READY TO TRANSFORM<br />YOUR STUDY HABITS?
              </h2>
              <Button size="lg" className="rounded-full px-10 h-14 text-lg bg-gradient-cosmic hover:glow-purple transition-all duration-500 group">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

