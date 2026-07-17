import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Image as ImageIcon, BookOpen, Newspaper,
  User, MessageCircle, MessageSquare, Users, BookMarked,
  X, GraduationCap, LayoutDashboard, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, clearAdminSession } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useLogoutAdmin, getGetAdminSessionQueryKey } from '@workspace/api-client-react';
import { SidLogoIcon, SidWordmark } from './SidLogo';

const navItems = [
  { path: '/',              icon: Home,          label: 'Home' },
  { path: '/memories',     icon: ImageIcon,     label: 'Memories' },
  { path: '/thoughts',     icon: BookOpen,      label: 'Thoughts' },
  { path: '/blog',         icon: Newspaper,     label: 'Sid Philosophy' },
  { path: '/learning',     icon: GraduationCap, label: 'Learning' },
  { path: '/about',        icon: User,          label: 'About' },
  { path: '/anonymous',    icon: MessageSquare, label: 'NGL' },
  { path: '/messages',     icon: MessageCircle, label: 'Messages' },
  { path: '/guestbook',    icon: Users,         label: 'Guestbook' },
];

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const [location, setLocation] = useLocation();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const logoutAdminMutation = useLogoutAdmin();

  const handleAdminLogout = () => {
    logoutAdminMutation.mutate(undefined, {
      onSuccess: async () => {
        clearAdminSession();
        window.dispatchEvent(new Event('sidko_admin_changed'));
        await queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() });
        onClose();
        setLocation('/');
      },
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-[280px] flex flex-col"
            style={{
              background: 'hsl(var(--background) / 0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderLeft: '1px solid hsl(var(--border) / 0.6)',
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <SidLogoIcon size="sm" />
                <SidWordmark className="text-sm" />
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground active:bg-muted/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav grid */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const isActive =
                    location === item.path ||
                    (item.path !== '/' && location.startsWith(item.path));
                  return (
                    <Link key={item.path} href={item.path}>
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className={cn(
                          'flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border transition-all cursor-pointer',
                          isActive
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-card border-border/50 text-muted-foreground active:bg-muted/60'
                        )}
                      >
                        <item.icon className={cn('w-5 h-5', isActive ? 'text-primary' : '')} strokeWidth={isActive ? 2.2 : 1.8} />
                        <span className={cn('text-xs font-medium', isActive ? 'text-primary' : '')}>{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}

                {isAdmin && (
                  <Link href="/dashboard">
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border col-span-2 transition-all cursor-pointer',
                        location.startsWith('/dashboard')
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-card border-border/50 text-muted-foreground active:bg-muted/60'
                      )}
                    >
                      <LayoutDashboard className="w-5 h-5" strokeWidth={1.8} />
                      <span className="text-xs font-medium">Dashboard</span>
                    </motion.div>
                  </Link>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="px-3 pb-3">
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-border/50 text-sm font-medium text-muted-foreground active:bg-destructive/10 active:text-destructive transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out of admin
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
