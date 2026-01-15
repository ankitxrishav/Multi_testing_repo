"use client";

import { useEffect, useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InstallPwaButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');

    useEffect(() => {
        // Detect Platform
        const ua = navigator.userAgent;
        if (/iPhone|iPad|iPod/i.test(ua)) {
            setPlatform('ios');
            setIsMobile(true);
        } else if (/Android/i.test(ua)) {
            setPlatform('android');
            setIsMobile(true);
        } else {
            setPlatform('desktop');
            setIsMobile(false);
        }

        // Check Standalone
        const checkStandalone = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
            setIsStandalone(!!isStandalone);
        };
        checkStandalone();

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            console.log('PWA Install Prompt Captured');
        };

        const installedHandler = () => {
            setIsStandalone(true);
            setDeferredPrompt(null);
            console.log('PWA Installed Successfully');
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', installedHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else if (platform === 'ios') {
            alert("To install Fenrir on your iPhone:\n1. Tap the 'Share' icon (bottom center).\n2. Scroll down and tap 'Add to Home Screen'.");
        } else if (platform === 'desktop') {
            alert("To install Fenrir on Desktop:\n1. Use Chrome or Edge browser.\n2. Look for the 'Install' icon in the address bar (top right).");
        } else {
            alert("To install Fenrir:\n1. Use Chrome/Edge/Safari.\n2. Add to Home Screen from the browser menu.");
        }
    };

    if (isStandalone) return null;

    // Always show button (Force Show)

    return (
        <Button
            onClick={handleInstall}
            className="glass px-8 py-7 rounded-2xl border-white/10 hover:bg-white/5 hover:border-brand-pink/50 text-white font-bold transition-all flex items-center gap-3 group"
        >
            <span className="bg-brand-pink/20 p-2 rounded-lg group-hover:bg-brand-pink/40 transition-colors">
                {isMobile ? <Smartphone className="w-5 h-5 text-brand-pink" /> : <Monitor className="w-5 h-5 text-brand-pink" />}
            </span>
            <div className="flex flex-col items-start leading-none">
                <span className="text-xs text-slate-400 font-medium mb-1">Stay Focused Anywhere</span>
                <span>Install PWA App</span>
            </div>
        </Button>
    );
}
