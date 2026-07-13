import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export function MobileHeader() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border">
      <Link href="/">
        <span className="flex items-center gap-2 cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-sm shadow-sm shadow-primary/30">
            S
          </div>
          <span className="font-bold text-sm tracking-tight">SidkoUniverse</span>
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {user ? (
          <button
            onClick={() => signOut(auth)}
            className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold"
          >
            {(user.displayName?.[0] || user.email?.[0] || 'S').toUpperCase()}
          </button>
        ) : (
          <Link href="/login">
            <span className="text-xs font-semibold text-primary hover:underline cursor-pointer px-2">
              Sign In
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
