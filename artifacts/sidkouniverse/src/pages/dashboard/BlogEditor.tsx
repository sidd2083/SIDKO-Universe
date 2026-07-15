import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { isFirebaseConfigured } from '@/lib/firebase';
import { orderBy } from 'firebase/firestore';
import { useFirestore } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/apiUpload';
import { addFirestoreDoc, updateFirestoreDoc, deleteFirestoreDoc, SERVER_TIMESTAMP } from '@/lib/firestoreApi';
import { Loader2, Globe, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function BlogEditor() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: blogs } = useFirestore<any>('blogs', [orderBy('createdAt', 'desc')]);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [readingTime, setReadingTime] = useState(5);
  const [file, setFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) setLocation('/');
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading || !isAdmin) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleSave = async (e: React.MouseEvent, published: boolean) => {
    e.preventDefault();
    if (!title || !content || !slug) return;
    if (!isFirebaseConfigured) {
      toast({ title: 'Firebase is not configured — blog posts cannot be saved yet.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      let finalCoverUrl = coverUrl;

      if (file) {
        finalCoverUrl = await uploadFile(file);
      }

      await addFirestoreDoc('blogs', {
        title,
        slug,
        content,
        excerpt,
        coverImage: finalCoverUrl,
        readingTime: Number(readingTime),
        published,
        createdAt: SERVER_TIMESTAMP,
      });

      setTitle(''); setSlug(''); setContent(''); setExcerpt('');
      setFile(null); setCoverUrl('');
      toast({ title: published ? 'Article published!' : 'Draft saved' });
    } catch (err: any) {
      toast({ title: err?.message ?? 'Failed to save article', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    try {
      await deleteFirestoreDoc('blogs', id);
      toast({ title: 'Article deleted' });
    } catch {
      toast({ title: 'Failed to delete article', variant: 'destructive' });
    }
  };

  const handleTogglePublish = async (id: string, currentlyPublished: boolean) => {
    try {
      await updateFirestoreDoc('blogs', id, { published: !currentlyPublished });
      toast({ title: currentlyPublished ? 'Unpublished' : 'Published' });
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Blog Editor</h1>

        {!isFirebaseConfigured && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-sm">
            ⚠️ Firebase is not connected — articles won't be saved until you configure Firebase in Settings.
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <form className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col h-[80vh]">
              <div className="mb-4 space-y-4">
                <input
                  type="text"
                  placeholder="Article Title"
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full bg-transparent border-b border-border px-2 py-3 text-2xl font-bold focus:outline-none focus:border-primary/50 text-foreground"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Slug</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                      required
                    />
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
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Excerpt (for list view)</label>
                  <textarea
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground h-16 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Cover Image <span className="text-primary font-normal">(upload directly — no Firebase needed)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  {file && (
                    <p className="text-xs text-muted-foreground mt-1">Selected: {file.name}</p>
                  )}
                </div>
              </div>

              <textarea
                placeholder="Write your article here... (Markdown supported)"
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full flex-1 bg-transparent border-none resize-none focus:outline-none text-foreground leading-relaxed custom-scrollbar mb-4 mt-2 border-t border-border/50 pt-4"
                required
              />

              <div className="pt-4 border-t border-border flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={e => handleSave(e, false)}
                  disabled={isSaving || !title || !content || !slug}
                  className="flex items-center gap-2 bg-muted text-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={e => handleSave(e, true)}
                  disabled={isSaving || !title || !content || !slug}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  Publish
                </button>
              </div>
            </form>
          </div>

          <div>
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm h-[80vh] flex flex-col">
              <h2 className="font-bold mb-6 text-xl">All Articles</h2>
              <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
                {blogs?.map((blog: any) => (
                  <div key={blog.id} className="bg-background border border-border rounded-2xl p-4 flex flex-col">
                    <div className="flex gap-4">
                      {blog.coverImage ? (
                        <div className="w-16 h-16 rounded-xl bg-muted shrink-0 overflow-hidden border border-border">
                          <img src={blog.coverImage} className="w-full h-full object-cover" alt="" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-muted shrink-0 flex items-center justify-center border border-border">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold truncate text-sm">{blog.title}</h3>
                          <span className={`shrink-0 ml-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded ${blog.published ? 'bg-green-500/20 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                            {blog.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">/{blog.slug}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {blog.createdAt ? format(blog.createdAt.toDate(), 'MMM d, yyyy') : ''}
                          </span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleTogglePublish(blog.id, blog.published)} className="text-xs font-medium hover:underline text-foreground">
                              {blog.published ? 'Unpublish' : 'Publish'}
                            </button>
                            <span className="text-border">•</span>
                            <button onClick={() => handleDelete(blog.id)} className="text-destructive text-xs font-medium hover:underline">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {blogs?.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">No articles written yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
