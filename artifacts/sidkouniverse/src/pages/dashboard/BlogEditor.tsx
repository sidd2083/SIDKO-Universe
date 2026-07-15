import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/apiUpload';
import { Loader2, Globe, FileText, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

interface Post { id: string; title: string; slug: string; content: string; excerpt: string; coverImage?: string; readingTime: number; published: boolean; createdAt: string; }

export default function BlogEditor() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = () => {
    fetch('/api/posts/all', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPosts(data); })
      .catch(() => {});
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) setLocation('/');
    else if (isAdmin) load();
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading || !isAdmin) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleSave = async (published: boolean) => {
    if (!title.trim() || !content.trim()) { toast({ title: 'Title and content required', variant: 'destructive' }); return; }
    setIsSaving(true);
    try {
      let coverImage = '';
      if (file) coverImage = await uploadFile(file);
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: title.trim(), slug, content: content.trim(), excerpt: excerpt.trim() || content.slice(0, 200), coverImage, readingTime: Math.max(1, Math.ceil(content.length / 1000)), published }),
      });
      if (!res.ok) throw new Error('Failed');
      setTitle(''); setSlug(''); setContent(''); setExcerpt(''); setFile(null);
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
        headers: { 'Content-Type': 'application/json' },
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
      await fetch(`/api/posts/${id}`, { method: 'DELETE', credentials: 'include' });
      toast({ title: 'Deleted' }); load();
    } catch { toast({ title: 'Failed to delete', variant: 'destructive' }); }
  };

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Blog / Philosophy Editor</h1>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-[80vh]">
            <input type="text" placeholder="Article Title" value={title} onChange={handleTitleChange}
              className="w-full bg-transparent border-b border-border py-3 text-2xl font-bold focus:outline-none focus:border-primary/50 text-foreground mb-4" />
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Slug (auto)</label>
                <input value={slug} onChange={e => setSlug(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none text-foreground" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Cover image (optional)</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary cursor-pointer" />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Excerpt (shown in list view)</label>
              <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short summary..."
                className="w-full bg-background border border-border rounded-xl px-3 py-2 h-14 resize-none focus:outline-none text-foreground text-sm" />
            </div>
            <textarea placeholder="Write your article... (Markdown supported)" value={content} onChange={e => setContent(e.target.value)}
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
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-[80vh] flex flex-col">
            <h2 className="font-bold text-xl mb-5">All Articles ({posts.length})</h2>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {posts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No articles yet.</p>}
              {posts.map(p => (
                <div key={p.id} className="bg-background border border-border rounded-xl p-4 flex gap-3">
                  {p.coverImage
                    ? <img src={p.coverImage} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border" alt="" />
                    : <div className="w-14 h-14 rounded-xl bg-muted shrink-0 flex items-center justify-center border border-border"><ImageIcon className="w-5 h-5 text-muted-foreground" /></div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{p.title}</h3>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md ${p.published ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                        {p.published ? 'Live' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">/{p.slug}</p>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
