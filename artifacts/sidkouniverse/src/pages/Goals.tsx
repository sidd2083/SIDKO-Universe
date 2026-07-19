import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { apiUrl } from '@/lib/apiBase';
import { GoalCard, Goal } from '@/components/cards/GoalCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Target } from 'lucide-react';

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/api/goals'))
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setGoals(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeGoals = goals.filter(g => g.progress < 100);
  const completedGoals = goals.filter(g => g.progress >= 100);

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Goals</h1>
        <p className="text-muted-foreground text-lg mb-10">
          What I'm working towards. Tracking progress in public keeps me accountable.
        </p>

        {loading ? (
          <div className="grid gap-6">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : goals.length > 0 ? (
          <div className="space-y-12">
            {activeGoals.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  In Progress
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {activeGoals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </section>
            )}

            {completedGoals.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  Completed
                </h2>
                <div className="grid md:grid-cols-2 gap-6 opacity-80">
                  {completedGoals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} className="bg-card/50" />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title="No goals set"
            description="Time to set some new targets."
          />
        )}
      </div>
    </PageWrapper>
  );
}
