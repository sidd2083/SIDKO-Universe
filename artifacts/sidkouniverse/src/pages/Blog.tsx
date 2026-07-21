import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { apiUrl } from '@/lib/apiBase';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, PenLine } from 'lucide-react';
import { format } from 'date-fns';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  readingTime: number;
  category: string;
  createdAt: string;
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.id}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all h-full flex flex-col"
      >
        {/* Cover image */}
        {post.coverImage ? (
          <div className="aspect-[16/9] overflow-hidden bg-muted flex-shrink-0">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 flex items-center justify-center">
            <PenLine className="w-8 h-8 text-primary/30" />
          </div>
        )}

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Category badge + reading time */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
              {post.category || 'General'}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              {post.readingTime || 5} min
            </span>
          </div>

          {/* Title */}
          <h2 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-200 mb-2 flex-1">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[11px] text-muted-foreground font-mono">
              {format(new Date(post.createdAt), 'MMM d, yyyy')}
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch(apiUrl('/api/posts'))
      .then(r => r.json())
      .then(data => { setPosts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];
  const filtered = activeCategory === 'All' ? posts : posts.filter(p => p.category === activeCategory);

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <PenLine className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Philosophy</span>
          </div>
          <h1 className="text-4xl font-black mb-3">How I think<br />about things.</h1>
          <p className="text-muted-foreground">
            Not advice. Not hot takes. Just things I've sat with long enough to write down.
          </p>
        </motion.div>

        {/* Category filter pills */}
        {!loading && categories.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[16/9] bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-muted rounded-full" />
                  <div className="h-5 w-3/4 bg-muted rounded-xl" />
                  <div className="h-3 w-full bg-muted rounded-xl" />
                  <div className="h-3 w-2/3 bg-muted rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center border border-dashed border-border rounded-2xl"
          >
            <PenLine className="w-10 h-10 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-foreground font-semibold mb-2">Nothing here yet.</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Ideas take time. When something is worth writing, it'll show up here.
            </p>
          </motion.div>
        )}

        {/* No results after filter */}
        {!loading && posts.length > 0 && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-16 text-center border border-dashed border-border rounded-2xl text-muted-foreground">
            <p className="text-sm">No posts in "{activeCategory}" yet.</p>
          </motion.div>
        )}

        {/* Post grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <PostCard post={p} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
