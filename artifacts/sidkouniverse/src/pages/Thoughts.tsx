import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useFirestore } from '@/hooks/useFirestore';
import { ThoughtCard, Thought } from '@/components/cards/ThoughtCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { BookOpen } from 'lucide-react';
import { orderBy, where } from 'firebase/firestore';

export default function Thoughts() {
  const { data: thoughts, loading } = useFirestore<Thought>('thoughts', [
    where('published', '==', true),
    orderBy('createdAt', 'desc')
  ]);

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Thoughts</h1>
        <p className="text-muted-foreground text-lg mb-10">
          Unfiltered reflections, ideas, and brain dumps. Like a digital journal.
        </p>

        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : thoughts.length > 0 ? (
          <div className="space-y-6">
            {thoughts.map(thought => (
              <ThoughtCard key={thought.id} thought={thought} />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={BookOpen} 
            title="No thoughts yet" 
            description="Check back later for new entries." 
          />
        )}
      </div>
    </PageWrapper>
  );
}