import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { apiUrl } from '@/lib/apiBase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { withAdminHeaders } from '@/lib/adminAuth';
import { Loader2, Globe, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Post { id: string; title: string; slug: string; content: string; excerpt: string; coverImage?: string; readingTime: number; published: boolean; createdAt: string; }

export default function BlogEditor() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = () => {
    fetch(apiUrl('/api/posts/all'), { headers: withAdminHeaders(), credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPosts(data); })
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
      const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const excerpt = content.trim().slice(0, 200);
      const readingTime = Math.max(1, Math.ceil(content.length / 1000));
      const res = await fetch(apiUrl('/api/posts'), {
        method: 'POST',
        headers: withAdminHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ title: title.trim(), slug, content: content.trim(), excerpt, coverImage: '', readingTime, published }),
      });
      if (!res.ok) throw new Error('Failed');
      setTitle(''); setContent('');
      toast({ title: published ? '🚀 Published!' : '📝 Draft saved' });
      load();
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (p: Post) => {
    try {
      await fetch(`/api/posts/${p.id}`, {
        method: 'PATCH',
        headers: withAdminHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ published: !p.published }),
      });
      toast({ title: p.published ? 'Unpublished' : 'Published' });
      load();
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE', headers: withAdminHeaders(), credentials: 'include' });
      toast({ title: 'Deleted' });
      load();
    } catch { toast({ title: 'Failed to delete', variant: 'destructive' }); }
  };

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Philosophy / Articles</h1>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-[80vh]">
            <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-transparent border-b border-border py-3 text-2xl font-bold focus:outline-none focus:border-primary/50 text-foreground mb-4" />
            <textarea placeholder="Write your article here... (Markdown supported)" value={content} onChange={e => setContent(e.target.value)}
              className="flex-1 bg-transparent resize-none focus:outline-none text-foreground leading-relaxed text-sm border-t border-border pt-4" />
            <div className="flex gap-2 pt-4 border-t border-border shrink-0 mt-4">
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

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-[80vh] flex flex-col">
            <h2 className="font-bold text-xl mb-5">All Articles ({posts.length})</h2>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {posts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No articles yet.</p>}
              {posts.map(p => (
                <div key={p.id} className="bg-background border border-border rounded-xl p-4">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md ${p.published ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                      {p.published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{p.excerpt || p.content.slice(0, 120)}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{format(new Date(p.createdAt), 'MMM d, yyyy')}</span>
                    <div className="flex gap-3 text-xs font-medium">
                      <button onClick={() => handleTogglePublish(p)} className="hover:underline text-foreground">
                        {p.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-destructive hover:underline">Delete</button>
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
