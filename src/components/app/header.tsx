
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { UserNav } from './user-nav';
import { ThemeToggle } from './theme-toggle';
import { FenrirLogo } from '@/components/icons';
import { Home, LayoutDashboard, Book, History, Settings, Flame } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { User } from '@/lib/definitions';
import { useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import Image from 'next/image';

export function AppHeader() {
  const { user, loading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const userDocRef = useMemo(() => (user && firestore ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
  const { data: userData } = useDoc<User>(userDocRef);

  // Streak expiration logic
  useEffect(() => {
    if (userData?.streak && userData?.lastStreakUpdate && firestore && user) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      const lastUpdate = userData.lastStreakUpdate;

      if (lastUpdate !== today && lastUpdate !== yesterday) {
        updateDoc(doc(firestore, 'users', user.uid), {
          streak: 0
        });
      }
    }
  }, [userData, firestore, user]);

  return (
    <header className="fixed top-0 z-50 w-full glass h-16 border-b border-border/50">
      <div className="container flex h-full items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
          <div className="w-9 h-9 relative flex items-center justify-center bg-gradient-cosmic rounded-lg glow-purple overflow-hidden">
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
            <span className="text-white font-bold text-2xl font-display relative z-10">F</span>
          </div>
          <span className="font-display font-bold text-xl tracking-wider text-gradient hidden sm:inline-block">
            FENRIR
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-border/50 group animate-pulse-slow">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400 group-hover:scale-110 transition-transform" />
              <span className="font-mono font-bold text-sm text-orange-400">{userData?.streak || 0}d</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {loading ? (
              <div className="h-9 w-9 glass rounded-full animate-pulse"></div>
            ) : user ? (
              <UserNav />
            ) : (
              <Button
                onClick={() => router.push('/login')}
                className="bg-gradient-cosmic hover:glow-purple transition-all duration-300 rounded-full px-6 text-white border-0"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-brand-purple to-transparent w-full opacity-50" />
    </header>
  );
}

