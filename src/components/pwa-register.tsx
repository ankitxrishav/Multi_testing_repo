"use client";

import { useEffect } from 'react';

export function PwaRegister() {
    useEffect(() => {
        // Global PWA Prompt Capture
        const handler = (e: any) => {
            e.preventDefault();
            (window as any).deferredPrompt = e;
            console.log('Global PWA Prompt Captured');
        };
        window.addEventListener('beforeinstallprompt', handler);

        // Service Worker Registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js').then(
                    function (registration) {
                        console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function (err) {
                        console.log('Service Worker registration failed: ', err);
                    }
                );
            });
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    return null;
}
