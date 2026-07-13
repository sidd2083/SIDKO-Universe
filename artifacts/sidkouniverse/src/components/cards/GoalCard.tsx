import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  targetDate: string;
  milestones: { title: string; done: boolean }[];
}

interface GoalCardProps {
  goal: Goal;
  className?: string;
}

export function GoalCard({ goal, className }: GoalCardProps) {
  const isCompleted = goal.progress >= 100;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-2xl p-5 bg-card border border-border shadow-sm transition-all",
        isCompleted && "border-success/30 bg-success/5",
        className
      )}
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-muted stroke-current"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={cn("stroke-current transition-all duration-1000", isCompleted ? "text-success" : "text-primary")}
              strokeWidth="3"
              strokeDasharray={`${goal.progress}, 100`}
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-xs font-bold">{goal.progress}%</span>
        </div>
        <div>
          <h3 className="font-bold text-foreground">{goal.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
        </div>
      </div>

      {goal.milestones && goal.milestones.length > 0 && (
        <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
          {goal.milestones.slice(0, 3).map((m, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              {m.done ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <span className={cn(m.done ? "text-muted-foreground line-through" : "text-foreground")}>
                {m.title}
              </span>
            </div>
          ))}
          {goal.milestones.length > 3 && (
            <p className="text-xs text-muted-foreground pl-6">+{goal.milestones.length - 3} more</p>
          )}
        </div>
      )}
    </motion.div>
  );
}