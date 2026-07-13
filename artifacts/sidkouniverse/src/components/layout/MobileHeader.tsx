import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Menu } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { SidLogoIcon, SidWordmark } from './SidLogo';
import { MobileDrawer } from './MobileDrawer';

const pageTitles: Record<string, string> = {
  '/': '',
  '/memories':     'Memories',
  '/thoughts':     'Thoughts',
  '/blog':         'Blog',
  '/timeline':     'Timeline',
  '/goals':        'Goals',
  '/achievements': 'Achievements',
  '/about':        'About',
  '/anonymous':    'NGL',
  '/messages':     'Messages',
  '/guestbook':    'Guestbook',
  '/profile':      'Profile',
  '/learning':     'Learning',
  '/dashboard':    'Dashboard',
};

function getTitle(location: string): string | null {
  if (location === '/') return null;
  for (const [path, title] of Object.entries(pageTitles)) {
    if (path !== '/' && location.startsWith(path)) return title;
  }
  return null;
}

export function MobileHeader() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [location] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pageTitle = getTitle(location);

  return (
    <>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <header
        className="md:hidden sticky top-0 z-40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div
          className="flex items-center justify-between px-4 h-14 border-b border-border/50"
          style={{
            background: 'hsl(var(--background) / 0.88)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          }}
        >
          {/* Left: logo or page title */}
          <Link href="/">
            <span className="flex items-center gap-2.5 cursor-pointer">
              <SidLogoIcon size="sm" />
              {pageTitle ? (
                <span className="font-bold text-base tracking-tight text-foreground">
                  {pageTitle}
                </span>
              ) : (
                <SidWordmark className="text-base" />
              )}
            </span>
          </Link>

          {/* Right: theme toggle + hamburger */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground active:bg-muted/80 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun className="w-[18px] h-[18px]" />
                : <Moon className="w-[18px] h-[18px]" />
              }
            </button>

            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground active:bg-muted/80 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-[20px] h-[20px]" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
