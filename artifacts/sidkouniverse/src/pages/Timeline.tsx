import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useFirestore } from '@/hooks/useFirestore';
import { Skeleton } from '@/components/shared/Skeleton';
import { orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Star } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  year: string;
  category: 'milestone' | 'achievement' | 'memory' | 'project' | 'other';
  location?: string;
  highlight?: boolean;
  emoji?: string;
}

const categoryColors: Record<string, string> = {
  milestone: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  achievement: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  memory: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  project: 'bg-green-500/10 text-green-500 border-green-500/20',
  other: 'bg-muted text-muted-foreground border-border',
};

const categoryDot: Record<string, string> = {
  milestone: 'bg-blue-500',
  achievement: 'bg-yellow-500',
  memory: 'bg-pink-500',
  project: 'bg-green-500',
  other: 'bg-muted-foreground',
};

export default function Timeline() {
  const { isAdmin } = useAuth();
  const { data: events, loading } = useFirestore<TimelineEvent>('timeline', [
    orderBy('date', 'desc'),
  ]);

  const eventsByYear = events.reduce((acc: Record<string, TimelineEvent[]>, ev) => {
    const year = ev.year || new Date(ev.date).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(ev);
    return acc;
  }, {});

  const years = Object.keys(eventsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-4 md:py-8">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Timeline</h1>
            <p className="text-muted-foreground">A record of my journey — milestones, projects, and memories.</p>
          </div>
          {isAdmin && (
            <Link href="/dashboard/timeline" className="text-xs font-medium text-primary hover:underline">
              Edit →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-8">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl">
            <Calendar className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p>No timeline events yet.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {years.map((year) => (
              <div key={year}>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-2xl font-bold text-foreground">{year}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="relative pl-6 space-y-6">
                  <div className="absolute left-0 top-2 bottom-0 w-px bg-border" />
                  {eventsByYear[year].map((ev, idx) => (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative"
                    >
                      <div className={`absolute -left-[25px] top-3 w-3 h-3 rounded-full border-2 border-background ${categoryDot[ev.category] || categoryDot.other}`} />
                      <div className={`bg-card border rounded-2xl p-5 hover:shadow-md transition-shadow ${ev.highlight ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border'}`}>
                        <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            {ev.emoji && <span className="text-xl">{ev.emoji}</span>}
                            <h3 className="font-semibold text-foreground">
                              {ev.title}
                              {ev.highlight && <Star className="w-3.5 h-3.5 inline ml-1.5 text-yellow-500 fill-yellow-500" />}
                            </h3>
                          </div>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${categoryColors[ev.category] || categoryColors.other}`}>
                            {ev.category}
                          </span>
                        </div>
                        {ev.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{ev.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(ev.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </span>
                          {ev.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
