import { PageWrapper } from '@/components/layout/PageWrapper';
import { apiUrl } from '@/lib/apiBase';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { BookOpen, Image as ImageIcon, PenTool } from 'lucide-react';
import { format } from 'date-fns';

interface Post { id: string; title: string; slug: string; excerpt: string; coverImage?: string; readingTime: number; createdAt: string; }

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
      <div className="max-w-3xl mx-auto py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <PenTool className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Sid Philosophy</span>
          </div>
          <h1 className="text-4xl font-black mb-3">Philosophy & Writing</h1>
          <p className="text-muted-foreground leading-relaxed">
            Longer pieces. Things I've thought about enough to write down. Not advice — just how I see things.
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-card border border-border rounded-2xl animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl text-muted-foreground">
            <PenTool className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="mb-1">Nothing published yet.</p>
            <p className="text-xs">Come back soon — ideas take time.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={`/blog/${p.id}`}>
                  <motion.div whileHover={{ y: -2 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer group flex gap-0">
                    {p.coverImage && (
                      <div className="w-40 shrink-0 overflow-hidden bg-muted hidden sm:block">
                        <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="flex-1 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <BookOpen className="w-3.5 h-3.5" />
                          {p.readingTime || 5} min read
                        </div>
                        <span className="text-xs text-muted-foreground">{format(new Date(p.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">{p.title}</h2>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{p.excerpt}</p>
                      <p className="text-xs font-semibold text-primary mt-4">Read article →</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
