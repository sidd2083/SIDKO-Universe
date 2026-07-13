import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Home, Image as ImageIcon, BookOpen, PenTool, User,
  Target, Award, MessageSquare, MessageCircle, Settings,
  LogOut, MapPin, Clock, Sun, Moon, LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from 'next-themes';

const navItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Memories', path: '/memories', icon: ImageIcon },
  { label: 'Thoughts', path: '/thoughts', icon: BookOpen },
  { label: 'Blog', path: '/blog', icon: PenTool },
  { label: 'Timeline', path: '/timeline', icon: Clock },
  { label: 'Goals', path: '/goals', icon: Target },
  { label: 'Achievements', path: '/achievements', icon: Award },
  { label: 'About', path: '/about', icon: User },
  { label: 'Anonymous', path: '/anonymous', icon: MessageSquare },
  { label: 'Messages', path: '/messages', icon: MessageCircle },
  { label: 'Guestbook', path: '/guestbook', icon: MapPin },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 border-r border-border bg-sidebar z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-base shadow-sm shadow-primary/30">
          S
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight">SidkoUniverse</span>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Siddhant's digital life</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
          return (
            <Link key={item.path} href={item.path}>
              <span className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 text-sm cursor-pointer",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}>
                <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "")} />
                {item.label}
              </span>
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="mx-3 my-2 h-px bg-border" />
            <Link href="/dashboard">
              <span className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 text-sm cursor-pointer",
                location.startsWith('/dashboard')
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}>
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                Dashboard
              </span>
            </Link>
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
        >
          {theme === 'dark' ? (
            <><Sun className="w-4 h-4" /> Light mode</>
          ) : (
            <><Moon className="w-4 h-4" /> Dark mode</>
          )}
        </button>

        {/* User */}
        {user ? (
          <div className="space-y-1">
            <Link href="/profile">
              <span className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary overflow-hidden shrink-0">
                  {user.photoURL
                    ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    : (user.displayName?.[0] || user.email?.[0] || 'S').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{user.displayName || user.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-muted-foreground">{isAdmin ? '⚡ Admin' : 'User'}</p>
                </div>
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log out
            </button>
          </div>
        ) : (
          <Link href="/login">
            <span className="flex items-center justify-center w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-xl text-sm font-semibold hover:brightness-110 transition-all cursor-pointer shadow-sm shadow-primary/20">
              Sign In
            </span>
          </Link>
        )}
      </div>
    </aside>
  );
}
