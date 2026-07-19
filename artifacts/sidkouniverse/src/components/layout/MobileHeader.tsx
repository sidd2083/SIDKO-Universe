import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Send, Download } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { SidLogoIcon, SidWordmark } from './SidLogo';
import { MobileDrawer } from './MobileDrawer';

const pageTitles: Record<string, string> = {
  '/':            '',
  '/memories':    'Memories',
  '/thoughts':    'Thoughts',
  '/blog':        'Sid Philosophy',
  '/about':       'About',
  '/anonymous':   'NGL',
  '/messages':    'Messages',
  '/guestbook':   'Guestbook',
  '/profile':     'Profile',
  '/learning':    'Learning',
  '/dashboard':   'Dashboard',
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
  const [location] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pageTitle = getTitle(location);

  // PWA install prompt
  const installPromptRef = useRef<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      installPromptRef.current = e;
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    // Already installed — hide button
    window.addEventListener('appinstalled', () => setCanInstall(false));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPromptRef.current) return;
    installPromptRef.current.prompt();
    const { outcome } = await installPromptRef.current.userChoice;
    if (outcome === 'accepted') setCanInstall(false);
    installPromptRef.current = null;
  };

  return (
    <>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <header
        className="md:hidden sticky top-0 z-40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div
          className="flex items-center justify-between px-4 h-14 border-b border-border/40"
          style={{
            background: 'hsl(var(--background) / 0.88)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          }}
        >
          {/* Left: logo or page title */}
          <Link href="/">
            <span className="flex items-center gap-2 cursor-pointer">
              <SidLogoIcon size="sm" />
              {pageTitle ? (
                <span className="font-bold text-base tracking-tight text-foreground">
                  {pageTitle}
                </span>
              ) : (
                <SidWordmark className="text-lg" />
              )}
            </span>
          </Link>

          {/* Right: install + DM + theme */}
          <div className="flex items-center gap-1">
            {/* PWA install — only shown when browser says it's installable */}
            {canInstall && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold cursor-pointer active:scale-95 transition-transform select-none"
                aria-label="Install app"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Install</span>
              </button>
            )}

            {/* DM me button */}
            <Link href="/messages">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold cursor-pointer active:scale-95 transition-transform select-none">
                <Send className="w-3.5 h-3.5" />
                DM me
              </span>
            </Link>

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
          </div>
        </div>
      </header>
    </>
  );
}
