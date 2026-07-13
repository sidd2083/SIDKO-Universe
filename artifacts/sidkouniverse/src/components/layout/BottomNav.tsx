import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Image as ImageIcon, BookOpen, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function BottomNav() {
  const [location] = useLocation();

  const items = [
    { id: 'home', path: '/', icon: Home, label: 'Home' },
    { id: 'memories', path: '/memories', icon: ImageIcon, label: 'Memories' },
    { id: 'thoughts', path: '/thoughts', icon: BookOpen, label: 'Thoughts' },
    { id: 'messages', path: '/messages', icon: MessageCircle, label: 'Messages' },
    { id: 'profile', path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
      <div className="bg-card/90 backdrop-blur-md border border-border rounded-2xl p-2 flex justify-around items-center shadow-lg">
        {items.map((item) => {
          const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
          
          return (
            <Link key={item.id} href={item.path} className="relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors">
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn("w-5 h-5 mb-1 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-[10px] font-medium transition-colors", isActive ? "text-primary" : "text-muted-foreground")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}