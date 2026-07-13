import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Home, Image as ImageIcon, BookOpen, PenTool, User, 
  Target, Award, MessageSquare, MessageCircle, Settings,
  LogOut, MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const getNavItems = (isAdmin: boolean) => {
  const publicItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Memories', path: '/memories', icon: ImageIcon },
    { label: 'Thoughts', path: '/thoughts', icon: BookOpen },
    { label: 'Blog', path: '/blog', icon: PenTool },
    { label: 'About', path: '/about', icon: User },
    { label: 'Goals', path: '/goals', icon: Target },
    { label: 'Achievements', path: '/achievements', icon: Award },
    { label: 'Anonymous', path: '/anonymous', icon: MessageSquare },
    { label: 'Messages', path: '/messages', icon: MessageCircle },
    { label: 'Guestbook', path: '/guestbook', icon: MapPin },
  ];

  if (isAdmin) {
    publicItems.push({ label: 'Dashboard', path: '/dashboard', icon: Settings });
  }

  return publicItems;
};

export function Sidebar() {
  const [location] = useLocation();
  const { user, isAdmin } = useAuth();
  const navItems = getNavItems(isAdmin);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 border-r border-border bg-background p-4 z-40">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          S
        </div>
        <span className="font-semibold tracking-tight">SidkoUniverse</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
          return (
            <Link key={item.path} href={item.path} className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200",
              isActive ? "bg-card text-primary font-medium shadow-sm" : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
            )}>
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 mt-4 border-t border-border">
        {user ? (
          <div className="flex flex-col gap-2">
            <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-card transition-colors">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : user.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.displayName || user.email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground">{isAdmin ? 'Admin' : 'User'}</p>
              </div>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-sm w-full text-left">
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        ) : (
          <Link href="/login" className="flex items-center justify-center w-full bg-primary text-primary-foreground py-2 px-4 rounded-md text-sm font-medium hover:brightness-110 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Sign In
          </Link>
        )}
      </div>
    </aside>
  );
}