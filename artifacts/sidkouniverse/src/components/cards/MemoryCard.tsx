import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import { LikeButton } from '../shared/LikeButton';
import { cn } from '@/lib/utils';

export interface Memory {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  mood: string;
  date: string; // ISO string
  location?: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
}

interface MemoryCardProps {
  memory: Memory;
  onClick: () => void;
  className?: string;
}

export function MemoryCard({ memory, onClick, className }: MemoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all",
        className
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {memory.images && memory.images.length > 0 ? (
          <img
            src={memory.images[0]}
            alt={memory.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-medium text-white">
          {memory.category}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground truncate">{memory.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {memory.date ? format(new Date(memory.date), 'MMM d, yyyy') : 'Unknown date'}
        </p>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
          <LikeButton liked={false} count={memory.likesCount || 0} onClick={(e) => { e.stopPropagation(); }} />
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span>{memory.commentsCount || 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}