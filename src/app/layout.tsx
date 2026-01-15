
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster"
import BottomNav from '@/components/app/bottom-nav';
import { AppHeader } from '@/components/app/header';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { PwaRegister } from '@/components/pwa-register';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Fenrir Study',
  description: 'Master Your Time, Elevate Your Focus',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fenrir Study',
  },
};

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/icon-192.png" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased selection:bg-brand-purple/30',
          inter.variable,
          jetbrains.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <PwaRegister />
            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
              <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-purple/10 blur-[120px] animate-float" />
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-brand-pink/5 blur-[100px] animate-float [animation-delay:2s]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-brand-cyan/5 blur-[80px] animate-float [animation-delay:4s]" />
                <div className="animate-grain opacity-[0.03] scale-[2]" />
              </div>

              <AppHeader />
              <main className="flex-1 pt-16 pb-24 relative z-10 transition-all duration-300">
                {children}
              </main>
              <footer className="fixed bottom-0 inset-x-0 z-50 h-20 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto">
                  <BottomNav />
                </div>
              </footer>
              <Toaster />
            </div>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

