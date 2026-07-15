import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Image as ImageIcon, MessageSquare, PenTool, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileDrawer } from './MobileDrawer';

const items = [
  { id: 'home',        path: '/',          icon: Home,          label: 'Home' },
  { id: 'memories',    path: '/memories',  icon: ImageIcon,     label: 'Memories' },
  { id: 'ngl',         path: '/anonymous', icon: MessageSquare, label: 'NGL' },
  { id: 'philosophy',  path: '/blog',      icon: PenTool,       label: 'Philosophy' },
];

export function BottomNav() {
  const [location] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div
          className="relative flex items-stretch border-t border-border/60"
          style={{
            background: 'hsl(var(--background) / 0.88)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          }}
        >
          {items.map((item) => {
            const isActive =
              location === item.path ||
              (item.path !== '/' && location.startsWith(item.path));

            return (
              <Link key={item.id} href={item.path} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex flex-col items-center justify-center pt-2.5 pb-1 gap-0.5 relative cursor-pointer select-none"
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="navPill"
                        className="absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] w-6 rounded-full bg-primary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <item.icon
                      className={cn(
                        'w-[22px] h-[22px] transition-colors duration-150',
                        isActive ? 'text-primary' : 'text-muted-foreground/70'
                      )}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                  </motion.div>

                  <span className={cn('text-[10px] font-medium transition-colors duration-150', isActive ? 'text-primary' : 'text-muted-foreground/60')}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}

          {/* More */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={() => setDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center pt-2.5 pb-1 gap-0.5 cursor-pointer select-none"
          >
            <Menu className="w-[22px] h-[22px] text-muted-foreground/70" strokeWidth={1.8} />
            <span className="text-[10px] font-medium text-muted-foreground/60">More</span>
          </motion.button>
        </div>
      </nav>
    </>
  );
}
