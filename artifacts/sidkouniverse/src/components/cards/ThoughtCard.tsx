import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { BookOpen } from 'lucide-react';
import { LikeButton } from '../shared/LikeButton';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';

export interface Thought {
  id: string;
  title: string;
  content: string;
  mood: string;
  readingTime: number;
  date?: string;
  createdAt: any;
  likesCount: number;
  commentsCount: number;
}

interface ThoughtCardProps {
  thought: Thought;
  className?: string;
}

export function ThoughtCard({ thought, className }: ThoughtCardProps) {
  return (
    <Link href={`/thoughts/${thought.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className={cn(
          "block group rounded-2xl p-5 bg-card border border-border shadow-sm hover:shadow-md transition-all cursor-pointer",
          className
        )}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-[10px] font-medium inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {thought.mood || 'Thinking'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{thought.readingTime || 2} min read</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {thought.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-5">
          {thought.content.replace(/[#*`_\[\]]/g, '')}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground font-medium">
            {thought.createdAt ? format(thought.createdAt.toDate ? thought.createdAt.toDate() : new Date(), 'MMM d, yyyy') : 'Recently'}
          </p>
          <LikeButton liked={false} count={thought.likesCount || 0} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} />
        </div>
      </motion.div>
    </Link>
  );
}