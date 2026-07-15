import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { orderBy } from 'firebase/firestore';
import { addFirestoreDoc, updateFirestoreDoc, deleteFirestoreDoc, SERVER_TIMESTAMP } from '@/lib/firestoreApi';
import { useFirestore } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Trash2, Globe } from 'lucide-react';
import { format } from 'date-fns';

export default function ThoughtEditor() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: thoughts } = useFirestore<any>('thoughts', [orderBy('createdAt', 'desc')]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('Thinking');
  const [tags, setTags] = useState('');
  const [readingTime, setReadingTime] = useState(2);
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      setLocation('/');
    }
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading || !isAdmin) return null;

  const handleSave = async (e: React.FormEvent, published: boolean) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSaving(true);
    try {
      await addFirestoreDoc('thoughts', {
        title,
        content,
        mood,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        readingTime: Number(readingTime),
        published,
        likesCount: 0,
        commentsCount: 0,
        createdAt: SERVER_TIMESTAMP,
      });

      setTitle('');
      setContent('');
      setTags('');
      toast({ title: published ? 'Thought published!' : 'Draft saved' });
    } catch (err) {
      toast({ title: 'Failed to save thought', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this thought?')) return;
    try {
      await deleteFirestoreDoc('thoughts', id);
      toast({ title: 'Thought deleted' });
    } catch (err) {
      toast({ title: 'Failed to delete thought', variant: 'destructive' });
    }
  };

  const handleTogglePublish = async (id: string, currentlyPublished: boolean) => {
    try {
      await updateFirestoreDoc('thoughts', id, { published: !currentlyPublished });
      toast({ title: currentlyPublished ? 'Unpublished' : 'Published' });
    } catch (err) {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Thought Editor</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <form className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col h-[70vh]">
              <div className="mb-4 space-y-4">
                <input
                  type="text"
                  placeholder="Thought Title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-border px-2 py-3 text-2xl font-bold focus:outline-none focus:border-primary/50 text-foreground"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Mood</label>
                    <select
                      value={mood}
                      onChange={e => setMood(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    >
                      {['Thinking', 'Happy', 'Frustrated', 'Inspired', 'Tired'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Read Time (min)</label>
                    <input
                      type="number"
                      value={readingTime}
                      onChange={e => setReadingTime(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>
                </div>
              </div>

              <textarea
                placeholder="Write your thought here... (Markdown supported)"
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full flex-1 bg-transparent border-none resize-none focus:outline-none text-foreground leading-relaxed custom-scrollbar mb-4"
                required
              />

              <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2 focus:outline-none text-sm text-foreground"
                />
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={e => handleSave(e, false)}
                    disabled={isSaving || !title || !content}
                    className="flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-xl font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={e => handleSave(e, true)}
                    disabled={isSaving || !title || !content}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Publish <Globe className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div>
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm h-[70vh] flex flex-col">
              <h2 className="font-bold mb-6 text-xl">All Thoughts</h2>
              <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
                {thoughts?.map(thought => (
                  <div key={thought.id} className="bg-background border border-border rounded-2xl p-4 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{thought.title}</h3>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${thought.published ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {thought.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{thought.content}</p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        {thought.createdAt ? format(thought.createdAt.toDate(), 'MMM d, yyyy') : ''}
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleTogglePublish(thought.id, thought.published)}
                          className="text-xs font-medium hover:underline text-foreground"
                        >
                          {thought.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <span className="text-border">•</span>
                        <button 
                          onClick={() => handleDelete(thought.id)}
                          className="text-destructive text-xs font-medium hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}