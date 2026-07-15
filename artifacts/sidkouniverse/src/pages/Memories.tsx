import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { motion } from 'framer-motion';
import { Image as ImageIcon, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Memory { id: string; title: string; description: string; images: string[]; category: string; mood: string; date: string; location: string; tags: string[]; createdAt: string; }

function MemoryCard({ memory, onClick }: { memory: Memory; onClick: () => void }) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} onClick={onClick}
      className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all">
      <div className="aspect-[4/5] relative overflow-hidden bg-muted">
        {memory.images?.[0]
          ? <img src={memory.images[0]} alt={memory.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-muted-foreground/30" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-bold text-sm leading-tight">{memory.title}</p>
          {memory.location && (
            <p className="text-white/70 text-xs flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {memory.location}
            </p>
          )}
        </div>
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-lg">
          {memory.category}
        </div>
      </div>
    </motion.div>
  );
}

export default function Memories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Memory | null>(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch('/api/memories')
      .then(r => r.json())
      .then(data => { setMemories(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(memories.map(m => m.category).filter(Boolean)))];
  const filtered = filter === 'All' ? memories : memories.filter(m => m.category === filter);

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Memories</span>
          </div>
          <h1 className="text-4xl font-black mb-3">Memories</h1>
          <p className="text-muted-foreground">Photos from my life. Places, people, moments I don't want to forget.</p>
        </motion.div>

        {/* Category filters */}
        {categories.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-8">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${filter === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[4/5] bg-card border border-border rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl text-muted-foreground">
            <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{memories.length === 0 ? 'No memories yet.' : `No ${filter} memories.`}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                <MemoryCard memory={m} onClick={() => setSelected(m)} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
              {selected.images?.[0] && (
                <div className="aspect-video bg-muted overflow-hidden">
                  <img src={selected.images[0]} alt={selected.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <h2 className="text-xl font-bold mb-1">{selected.title}</h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  {selected.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selected.location}</span>}
                  {selected.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(selected.date), 'MMM d, yyyy')}</span>}
                </div>
                {selected.description && <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>}
                {selected.tags?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-3">
                    {selected.tags.map(tag => <span key={tag} className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md">#{tag}</span>)}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
