import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Home, Image as ImageIcon, BookOpen, PenTool, User,
  Target, Award, MessageSquare, MessageCircle,
  LogOut, MapPin, Clock, Sun, Moon, LayoutDashboard, GraduationCap, Users,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { isFirebaseConfigured } from '@/lib/firebase';
import { getAuth, signOut } from 'firebase/auth';
import { useTheme } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import { useLogoutAdmin, getGetAdminSessionQueryKey } from '@workspace/api-client-react';
import { SidLogoIcon, SidWordmark } from './SidLogo';

const navItems = [
  { label: 'Home',         path: '/',            icon: Home },
  { label: 'Memories',     path: '/memories',    icon: ImageIcon },
  { label: 'Thoughts',     path: '/thoughts',    icon: BookOpen },
  { label: 'Blog',         path: '/blog',        icon: PenTool },
  { label: 'Timeline',     path: '/timeline',    icon: Clock },
  { label: 'Goals',        path: '/goals',       icon: Target },
  { label: 'Achievements', path: '/achievements',icon: Award },
  { label: 'Learning',     path: '/learning',    icon: GraduationCap },
  { label: 'About',        path: '/about',       icon: User },
  { label: 'NGL',          path: '/anonymous',   icon: MessageSquare },
  { label: 'Messages',     path: '/messages',    icon: MessageCircle },
  { label: 'Guestbook',    path: '/guestbook',   icon: Users },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const logoutAdminMutation = useLogoutAdmin();

  const handleLogout = async () => {
    if (isFirebaseConfigured) {
      await signOut(getAuth());
    }
    setLocation('/');
  };

  const handleAdminLogout = () => {
    logoutAdminMutation.mutate(undefined, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() });
        setLocation('/');
      },
    });
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 border-r border-border bg-sidebar z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <SidLogoIcon size="md" />
        <div className="flex flex-col gap-0.5">
          <SidWordmark className="text-sm" />
          <p className="text-[10px] text-muted-foreground leading-none">Siddhant's digital life</p>
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

        {/* Admin session (independent of visitor account) */}
        {isAdmin && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-primary/5">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">Siddhant</p>
              <p className="text-[10px] text-muted-foreground">⚡ Admin</p>
            </div>
            <button
              onClick={handleAdminLogout}
              aria-label="Log out of admin"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Visitor account */}
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
                  <p className="text-[10px] text-muted-foreground">User</p>
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
        ) : !isAdmin ? (
          <Link href="/login">
            <span className="flex items-center justify-center w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-xl text-sm font-semibold hover:brightness-110 transition-all cursor-pointer shadow-sm shadow-primary/20">
              Sign In
            </span>
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
