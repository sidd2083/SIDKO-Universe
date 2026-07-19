import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useRoute } from 'wouter';
import { apiUrl } from '@/lib/apiBase';
import { format } from 'date-fns';
import { Skeleton } from '@/components/shared/Skeleton';
import { ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'wouter';

export default function BlogPost() {
  const [, params] = useRoute('/blog/:slug');
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!params?.slug) return;
      try {
        const res = await fetch(apiUrl(`/api/posts/${params.slug}`));
        if (!res.ok) { setPost(null); return; }
        setPost(await res.json());
      } catch (err) {
        console.error(err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [params?.slug]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-24 mb-8 rounded-lg" />
          <Skeleton className="h-12 w-3/4 mb-4 rounded-xl" />
          <Skeleton className="h-6 w-1/3 mb-10 rounded-lg" />
          <Skeleton className="h-64 w-full mb-10 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!post) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Article not found</h2>
          <Link href="/blog" className="text-primary hover:underline">Back to blog</Link>
        </div>
      </PageWrapper>
    );
  }

  // createdAt comes from the API as an ISO string
  const createdDate = post.createdAt ? new Date(post.createdAt) : null;

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10 pb-8 border-b border-border">
          {createdDate && <span>{format(createdDate, 'MMMM d, yyyy')}</span>}
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{post.readingTime || 5} min read</span>
          </div>
        </div>

        {post.coverImage && (
          <div className="w-full aspect-[2/1] md:aspect-[21/9] rounded-3xl overflow-hidden mb-12 bg-muted">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
          {post.content?.split('\n').map((line: string, i: number) => {
            if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold text-foreground mt-8 mb-4">{line.replace('# ', '')}</h1>;
            if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-foreground mt-8 mb-4">{line.replace('## ', '')}</h2>;
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} className="mb-4 leading-relaxed">{line}</p>;
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
