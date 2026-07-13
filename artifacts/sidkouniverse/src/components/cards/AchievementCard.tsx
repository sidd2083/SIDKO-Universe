import React from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  badge?: string;
  image?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  className?: string;
}

export function AchievementCard({ achievement, className }: AchievementCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-2xl overflow-hidden bg-card border border-border shadow-sm transition-all group flex flex-col",
        className
      )}
    >
      {achievement.image ? (
        <div className="aspect-video w-full overflow-hidden">
          <img src={achievement.image} alt={achievement.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      ) : (
        <div className="h-24 bg-primary/10 flex items-center justify-center">
          <Award className="w-10 h-10 text-primary" />
        </div>
      )}
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-foreground text-lg mb-2">{achievement.title}</h3>
        <p className="text-sm text-muted-foreground flex-1">{achievement.description}</p>
        
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mt-4 pt-4 border-t border-border/50">
          <Calendar className="w-3.5 h-3.5" />
          <span>{achievement.date ? format(new Date(achievement.date), 'MMMM yyyy') : 'Unknown Date'}</span>
        </div>
      </div>
    </motion.div>
  );
}