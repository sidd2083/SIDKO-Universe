import { PageWrapper } from '@/components/layout/PageWrapper';
import { apiUrl } from '@/lib/apiBase';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { BookOpen, PenTool } from 'lucide-react';
import { format } from 'date-fns';

interface Thought { id: string; title: string; content: string; mood: string; tags: string[]; readingTime: number; createdAt: string; }

export default function Thoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/api/thoughts'))
      .then(r => r.json())
      .then(data => { setThoughts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <PenTool className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Thoughts</span>
          </div>
          <h1 className="text-4xl font-black mb-3">Articles & Thinking</h1>
          <p className="text-muted-foreground">Things on my mind. Ideas, observations, half-finished theories.</p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-card border border-border rounded-2xl animate-pulse" />)}
          </div>
        ) : thoughts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl text-muted-foreground">
            <PenTool className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>Nothing written yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {thoughts.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/thoughts/${t.id}`}>
                  <motion.div whileHover={{ y: -2 }}
                    className="block bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group h-full">
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t.mood || 'Thinking'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BookOpen className="w-3.5 h-3.5" />
                        {t.readingTime || 2} min
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">{t.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{t.content.replace(/[#*`_\[\]]/g, '').slice(0, 150)}…</p>
                    <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50">
                      {format(new Date(t.createdAt), 'MMM d, yyyy')}
                    </p>
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
