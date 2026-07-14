import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useFirestore } from '@/hooks/useFirestore';
import { Skeleton } from '@/components/shared/Skeleton';
import { PenTool, Clock } from 'lucide-react';
import { orderBy, where } from 'firebase/firestore';
import { Link } from 'wouter';
import { format } from 'date-fns';

export default function Blog() {
  const { data: blogs, loading } = useFirestore<any>('blogs', [
    where('published', '==', true),
    orderBy('createdAt', 'desc')
  ]);

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Sid Philosophy</h1>
        <p className="text-muted-foreground text-lg mb-10">
          Longer articles on tech, life, and building things.
        </p>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {blogs.map(blog => (
              <Link key={blog.id} href={`/blog/${blog.slug}`}>
                <div className="group cursor-pointer rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                  <div className="aspect-[2/1] w-full bg-muted overflow-hidden relative">
                    {blog.coverImage ? (
                      <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PenTool className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{blog.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{blog.excerpt || 'Read the full article to learn more.'}</p>
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-4 border-t border-border/50">
                      <span>{blog.createdAt ? format(blog.createdAt.toDate(), 'MMM d, yyyy') : ''}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{blog.readingTime || 5} min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/20">
            <PenTool className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">No articles yet</p>
            <p className="text-sm text-muted-foreground">Writing is in progress.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}