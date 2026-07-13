import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useRoute, Link } from 'wouter';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/shared/Skeleton';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { LikeButton } from '@/components/shared/LikeButton';

export default function MemoryDetail() {
  const [, params] = useRoute('/memories/:id');
  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemory() {
      if (!params?.id) return;
      try {
        const d = await getDoc(doc(db, 'memories', params.id));
        if (d.exists()) {
          setMemory({ id: d.id, ...d.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMemory();
  }, [params?.id]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-24 mb-8 rounded-lg" />
          <Skeleton className="h-[60vh] w-full rounded-3xl mb-8" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-1/3 mb-8" />
        </div>
      </PageWrapper>
    );
  }

  if (!memory) return null;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-8">
        <Link href="/memories" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Memories
        </Link>

        {memory.images && memory.images.length > 0 && (
          <div className="w-full h-[50vh] md:h-[70vh] bg-black rounded-3xl overflow-hidden mb-8 flex items-center justify-center border border-border">
            <img src={memory.images[0]} alt={memory.title} className="max-w-full max-h-full object-contain" />
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="inline-block px-3 py-1 bg-muted rounded-lg text-xs font-bold uppercase tracking-wider mb-3">
              {memory.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{memory.title}</h1>
            <p className="text-sm text-muted-foreground font-medium">
              {memory.date ? format(new Date(memory.date), 'MMMM d, yyyy') : 'Unknown Date'}
              {memory.location && ` • ${memory.location}`}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <LikeButton liked={false} count={memory.likesCount || 0} onClick={() => {}} className="scale-110" />
            <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <MessageCircle className="w-5 h-5" /> {memory.commentsCount || 0}
            </div>
          </div>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground mb-12 pb-12 border-b border-border">
          <p className="leading-relaxed">{memory.description}</p>
        </div>
        
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12">
            {memory.tags.map((tag: string) => (
              <span key={tag} className="text-sm bg-muted/50 px-3 py-1.5 rounded-md border border-border">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}