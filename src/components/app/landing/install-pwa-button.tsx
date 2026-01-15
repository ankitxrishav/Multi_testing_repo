"use client";

import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InstallPwaButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if mobile (basic)
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            console.log('PWA Install Triggered');
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        }
    };

    // If installed, or not mobile, maybe hide?
    // User asked for "mobile pwa app is installed" context.
    // We show button if:
    // 1. deferredPrompt exists (Android/Chrome Desktop)
    // 2. OR it is mobile (iOS PWA install is manual "Share -> Add to Home", we can show instructions)

    if (!deferredPrompt && !isMobile) return null; // Hide on desktop if already installed/not prompted

    return (
        <Button
            onClick={deferredPrompt ? handleInstall : () => alert("Tap 'Share' > 'Add to Home Screen' to install.")}
            className="glass px-8 py-7 rounded-2xl border-white/10 hover:bg-white/5 hover:border-brand-pink/50 text-white font-bold transition-all flex items-center gap-3 group"
        >
            <span className="bg-brand-pink/20 p-2 rounded-lg group-hover:bg-brand-pink/40 transition-colors">
                <Smartphone className="w-5 h-5 text-brand-pink" />
            </span>
            Install App
        </Button>
    );
}
