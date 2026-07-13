import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useFirestore } from '@/hooks/useFirestore';
import { AchievementCard, Achievement } from '@/components/cards/AchievementCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Award } from 'lucide-react';
import { orderBy, where } from 'firebase/firestore';

export default function Achievements() {
  const { data: achievements, loading } = useFirestore<Achievement>('achievements', [
    where('public', '==', true),
    orderBy('date', 'desc')
  ]);

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Achievements</h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
          Milestones, wins, and moments I'm proud of. A digital trophy case.
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : achievements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {achievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={Award} 
            title="Trophy case empty" 
            description="Check back later for achievements." 
          />
        )}
      </div>
    </PageWrapper>
  );
}