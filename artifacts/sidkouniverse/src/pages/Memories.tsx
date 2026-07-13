import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useFirestore } from '@/hooks/useFirestore';
import { MemoryCard, Memory } from '@/components/cards/MemoryCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ImageIcon, X } from 'lucide-react';
import { orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function Memories() {
  const { data: memories, loading } = useFirestore<Memory>('memories', [orderBy('createdAt', 'desc')]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const categories = ['All', 'Gym', 'College', 'Friends', 'Family', 'Coding', 'Life'];

  const filteredMemories = selectedCategory === 'All' 
    ? memories 
    : memories.filter(m => m.category === selectedCategory);

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Memories</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
          Moments captured in time. Scroll through the archive of my life.
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)}
          </div>
        ) : filteredMemories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMemories.map(memory => (
              <MemoryCard 
                key={memory.id} 
                memory={memory} 
                onClick={() => setSelectedMemory(memory)} 
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={ImageIcon} 
            title="No memories found" 
            description="There are no memories in this category yet." 
          />
        )}
      </div>

      <AnimatePresence>
        {selectedMemory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-background/95 backdrop-blur-sm"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row relative"
            >
              <button 
                onClick={() => setSelectedMemory(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 backdrop-blur-md transition-colors md:hidden"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full md:w-3/5 bg-black h-64 md:h-[90vh] flex items-center justify-center shrink-0">
                {selectedMemory.images && selectedMemory.images[0] && (
                  <img src={selectedMemory.images[0]} alt={selectedMemory.title} className="max-w-full max-h-full object-contain" />
                )}
              </div>
              <div className="flex-1 p-6 md:p-8 flex flex-col h-full max-h-[50vh] md:max-h-[90vh] overflow-y-auto custom-scrollbar bg-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-muted rounded-md text-[10px] font-medium mb-3">
                      {selectedMemory.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{selectedMemory.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedMemory.date ? format(new Date(selectedMemory.date), 'MMMM d, yyyy') : 'Unknown Date'}
                      {selectedMemory.location && ` • ${selectedMemory.location}`}
                    </p>
                  </div>
                  <button onClick={() => setSelectedMemory(null)} className="hidden md:flex p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mt-4 flex-1">
                  <p>{selectedMemory.description}</p>
                </div>
                
                {selectedMemory.tags && selectedMemory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {selectedMemory.tags.map(tag => (
                      <span key={tag} className="text-xs bg-muted/50 px-2 py-1 rounded border border-border">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}