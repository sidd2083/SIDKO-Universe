import React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export function LikeButton({ liked, count, onClick, className }: LikeButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium transition-colors",
        liked ? "text-destructive" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <Heart className={cn("w-4 h-4 transition-colors", liked && "fill-current")} />
      <span>{count}</span>
    </motion.button>
  );
}