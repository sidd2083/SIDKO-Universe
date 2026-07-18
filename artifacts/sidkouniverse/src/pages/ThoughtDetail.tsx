import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useRoute, Link } from 'wouter';
import { format } from 'date-fns';
import { Skeleton } from '@/components/shared/Skeleton';
import { ArrowLeft, Clock } from 'lucide-react';

export default function ThoughtDetail() {
  const [, params] = useRoute('/thoughts/:id');
  const [thought, setThought] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/thoughts/${params.id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => setThought(data))
      .catch(() => setThought(null))
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-10 w-24 mb-8 rounded-lg" />
          <Skeleton className="h-12 w-full mb-4 rounded-xl" />
          <div className="space-y-4 mt-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!thought) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto py-8">
          <Link href="/thoughts" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Thoughts
          </Link>
          <p className="text-muted-foreground">Thought not found.</p>
        </div>
      </PageWrapper>
    );
  }

  // createdAt is an ISO string from the API
  const createdDate = thought.createdAt ? new Date(thought.createdAt) : null;

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-8">
        <Link href="/thoughts" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Thoughts
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {thought.mood || 'Thinking'}
            </div>
            <span className="text-muted-foreground text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {thought.readingTime || 2} min read
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground leading-tight">
            {thought.title}
          </h1>

          <p className="text-sm text-muted-foreground font-medium pb-8 border-b border-border/50">
            {createdDate ? format(createdDate, 'MMMM d, yyyy • h:mm a') : ''}
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground mb-12">
          {thought.content?.split('\n').map((line: string, i: number) => {
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} className="mb-4 leading-relaxed">{line}</p>;
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
