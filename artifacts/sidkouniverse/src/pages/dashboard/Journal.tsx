import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, orderBy, limit, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Journal() {
  const { isAdmin, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('Neutral');
  const [isSaving, setIsSaving] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      setLocation('/');
    }
  }, [isAdmin, isLoading, setLocation]);

  useEffect(() => {
    async function fetchJournal() {
      if (!user) return;
      try {
        const q = collection(db, `journal_${user.uid}`);
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => 
          (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
        );
        setEntries(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingEntries(false);
      }
    }
    fetchJournal();
  }, [user]);

  if (isLoading || !isAdmin) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    setIsSaving(true);
    try {
      const newEntry = {
        content,
        mood,
        createdAt: serverTimestamp(),
        dateStr: format(new Date(), 'yyyy-MM-dd')
      };
      
      const docRef = await addDoc(collection(db, `journal_${user?.uid}`), newEntry);
      
      setEntries([{ id: docRef.id, ...newEntry, createdAt: { toDate: () => new Date() } }, ...entries]);
      setContent('');
      toast({ title: 'Entry saved' });
    } catch (err) {
      toast({ title: 'Failed to save entry', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await deleteDoc(doc(db, `journal_${user?.uid}`, id));
      setEntries(entries.filter(e => e.id !== id));
      toast({ title: 'Entry deleted' });
    } catch (err) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Private Journal</h1>
        <p className="text-muted-foreground mb-8">For your eyes only. Data stored securely.</p>

        <form onSubmit={handleSave} className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">New Entry</h2>
            <select
              value={mood}
              onChange={e => setMood(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            >
              {['Happy', 'Neutral', 'Sad', 'Frustrated', 'Excited', 'Anxious', 'Tired'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="How are you feeling today?..."
            className="w-full bg-background border border-border rounded-xl p-4 min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground mb-4"
            required
          />
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving || !content}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Save Entry
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <h2 className="font-bold text-xl mb-4">Previous Entries</h2>
          
          {loadingEntries ? (
            <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : entries.length > 0 ? (
            entries.map((entry, i) => {
              const isNewDay = i === 0 || entry.dateStr !== entries[i-1].dateStr;
              return (
                <div key={entry.id}>
                  {isNewDay && (
                    <div className="flex items-center gap-4 mb-4 mt-8">
                      <h3 className="font-bold text-sm text-muted-foreground">
                        {entry.createdAt?.toDate ? format(entry.createdAt.toDate(), 'MMMM d, yyyy') : 'Recently'}
                      </h3>
                      <div className="h-px bg-border flex-1"></div>
                    </div>
                  )}
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative group">
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {entry.mood}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {entry.createdAt?.toDate ? format(entry.createdAt.toDate(), 'h:mm a') : ''}
                      </span>
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-3xl">
              No journal entries yet.
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}