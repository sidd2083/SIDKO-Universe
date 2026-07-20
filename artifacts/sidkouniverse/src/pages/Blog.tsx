import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { apiUrl } from '@/lib/apiBase';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Clock, PenLine } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  readingTime: number;
  createdAt: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/api/posts'))
      .then(r => r.json())
      .then(data => { setPosts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Philosophy</p>
          <h1 className="text-[2.6rem] font-black tracking-tight leading-tight mb-4">
            How I think<br />about things.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
            Not advice. Not hot takes. Just things I've sat with long enough to write down.
            Written slowly. Read at your own pace.
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <div className="h-3 w-24 bg-card border border-border rounded-full animate-pulse" />
                <div className="h-7 w-3/4 bg-card border border-border rounded-xl animate-pulse" />
                <div className="h-4 w-full bg-card border border-border rounded-xl animate-pulse" />
                <div className="h-4 w-2/3 bg-card border border-border rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <PenLine className="w-10 h-10 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-foreground font-semibold mb-2">Nothing here yet.</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Ideas take time. When something is worth writing, it'll show up here.
            </p>
          </motion.div>
        )}

        {/* Posts */}
        {!loading && posts.length > 0 && (
          <div className="space-y-0 divide-y divide-border/50">
            {posts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link href={`/blog/${p.id}`}>
                  <div className="group py-8 cursor-pointer">
                    {/* Meta row */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wide">
                        {format(new Date(p.createdAt), 'MMM d, yyyy')}
                      </span>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {p.readingTime || 5} min
                      </span>
                    </div>

                    {/* Title + arrow */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h2 className="text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-200 flex-1">
                        {p.title}
                      </h2>
                      <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0 mt-1" />
                    </div>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {p.excerpt}
                    </p>

                    {/* Cover image — inline, below excerpt, only on bigger posts */}
                    {p.coverImage && i === 0 && (
                      <div className="mt-5 rounded-2xl overflow-hidden aspect-[2/1] bg-muted">
                        <img
                          src={p.coverImage}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
