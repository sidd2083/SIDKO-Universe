import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Globe, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Thought { id: string; title: string; content: string; mood: string; tags: string[]; readingTime: number; published: boolean; createdAt: string; }

export default function ThoughtEditor() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('Thinking');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = () => {
    fetch('/api/thoughts/all', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setThoughts(data); })
      .catch(() => {});
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) setLocation('/');
    else if (isAdmin) load();
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading || !isAdmin) return null;

  const handleSave = async (published: boolean) => {
    if (!title.trim() || !content.trim()) { toast({ title: 'Title and content required', variant: 'destructive' }); return; }
    setIsSaving(true);
    try {
      const res = await fetch('/api/thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          mood,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          readingTime: Math.max(1, Math.ceil(content.length / 1000)),
          published,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setTitle(''); setContent(''); setTags('');
      toast({ title: published ? '🚀 Published!' : '📝 Draft saved' });
      load();
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (t: Thought) => {
    try {
      await fetch(`/api/thoughts/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ published: !t.published }),
      });
      toast({ title: t.published ? 'Unpublished' : 'Published' });
      load();
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this thought?')) return;
    try {
      await fetch(`/api/thoughts/${id}`, { method: 'DELETE', credentials: 'include' });
      toast({ title: 'Deleted' });
      load();
    } catch { toast({ title: 'Failed to delete', variant: 'destructive' }); }
  };

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Thought Editor</h1>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-[70vh]">
            <input type="text" placeholder="Thought Title" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-transparent border-b border-border py-3 text-2xl font-bold focus:outline-none focus:border-primary/50 text-foreground mb-4" />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Mood</label>
                <select value={mood} onChange={e => setMood(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 focus:outline-none text-foreground text-sm">
                  {['Thinking', 'Happy', 'Frustrated', 'Inspired', 'Tired', 'Motivated'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tags (comma separated)</label>
                <input value={tags} onChange={e => setTags(e.target.value)} placeholder="life, code, ..."
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 focus:outline-none text-foreground text-sm" />
              </div>
            </div>
            <textarea placeholder="Write your thought... (Markdown supported)" value={content} onChange={e => setContent(e.target.value)}
              className="flex-1 bg-transparent resize-none focus:outline-none text-foreground leading-relaxed text-sm mb-4 border-t border-border pt-4" />
            <div className="flex gap-2 pt-4 border-t border-border shrink-0">
              <button onClick={() => handleSave(false)} disabled={isSaving || !title || !content}
                className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-muted/80 disabled:opacity-50">
                <FileText className="w-4 h-4" /> Save Draft
              </button>
              <button onClick={() => handleSave(true)} disabled={isSaving || !title || !content}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 disabled:opacity-50">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                Publish
              </button>
            </div>
          </div>

          {/* List */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-[70vh] flex flex-col">
            <h2 className="font-bold text-xl mb-5">All Thoughts ({thoughts.length})</h2>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {thoughts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No thoughts yet.</p>}
              {thoughts.map(t => (
                <div key={t.id} className="bg-background border border-border rounded-xl p-4">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="font-semibold text-sm leading-tight">{t.title}</h3>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md ${t.published ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                      {t.published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{t.content.slice(0, 80)}…</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{format(new Date(t.createdAt), 'MMM d, yyyy')}</span>
                    <div className="flex gap-3 text-xs font-medium">
                      <button onClick={() => handleTogglePublish(t)} className="hover:underline text-foreground">
                        {t.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="text-destructive hover:underline">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
