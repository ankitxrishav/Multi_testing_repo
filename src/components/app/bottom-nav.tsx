
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, LayoutDashboard, Book, History, Settings, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();

  const routes = [
    { href: '/', label: 'Timer', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/subjects', label: 'Subjects', icon: Book },
    { href: '/history', label: 'History', icon: History },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  if (pathname === '/login') {
    return null;
  }

  return (
    <nav className="glass border-white/5 p-1.5 shadow-2xl rounded-2xl flex items-center gap-1 md:gap-2 md:p-2 pointer-events-auto overflow-hidden">
      {routes.map((route) => {
        const isActive = pathname === route.href;
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'relative flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-500 md:px-5 md:py-3 md:text-sm group',
              isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-nav-bg"
                className="absolute inset-0 z-0 rounded-xl bg-gradient-cosmic glow-purple"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <route.icon className={cn('relative z-10 h-4 w-4 md:h-5 md:w-5 transition-transform duration-500', isActive && 'scale-110')} />
            <span className={cn('relative z-10 transition-all duration-500', isActive ? 'block font-bold' : 'hidden lg:block opacity-60 group-hover:opacity-100')}>
              {route.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

