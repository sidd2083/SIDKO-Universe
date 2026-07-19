import { useState, useEffect, useRef } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { apiUrl } from '@/lib/apiBase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/apiUpload';
import { withAdminHeaders } from '@/lib/adminAuth';
import { Loader2, Upload, Trash2, Image as ImageIcon } from 'lucide-react';

interface Memory { id: string; title: string; description: string; images: string[]; category: string; mood: string; date: string; location: string; tags: string[]; createdAt: string; }

export default function MemoryManager() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Life');
  const [mood, setMood] = useState('Happy');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationStr, setLocationStr] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const load = () => {
    fetch(apiUrl('/api/memories'))
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMemories(data); })
      .catch(() => {});
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) setLocation('/');
    else if (isAdmin) load();
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading || !isAdmin) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) { toast({ title: 'Title and image are required', variant: 'destructive' }); return; }
    setIsUploading(true);
    try {
      const imageUrl = await uploadFile(file);
      const res = await fetch(apiUrl('/api/memories'), {
        method: 'POST',
        headers: withAdminHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          images: [imageUrl],
          category,
          mood,
          date,
          location: locationStr.trim(),
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? 'Failed');
      }
      setTitle(''); setDescription(''); setFile(null); setTags(''); setLocationStr('');
      toast({ title: '📸 Memory saved!' });
      load();
    } catch (err: any) {
      toast({ title: err?.message ?? 'Failed to upload memory', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memory?')) return;
    try {
      await fetch(`/api/memories/${id}`, { method: 'DELETE', headers: withAdminHeaders(), credentials: 'include' });
      toast({ title: 'Deleted' }); load();
    } catch { toast({ title: 'Failed to delete', variant: 'destructive' }); }
  };

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Memory Manager</h1>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Add form */}
          <div className="md:col-span-1">
            <form onSubmit={handleUpload} className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold mb-2">Add New Memory</h2>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none">
                    {['Life', 'Travel', 'Food', 'People', 'Achievement', 'Nature', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Mood</label>
                  <select value={mood} onChange={e => setMood(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none">
                    {['Happy', 'Nostalgic', 'Excited', 'Peaceful', 'Grateful', 'Proud'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Location</label>
                <input type="text" value={locationStr} onChange={e => setLocationStr(e.target.value)}
                  placeholder="e.g. Kathmandu, Nepal"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tags (comma separated)</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                  placeholder="travel, food, ..."
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Image *</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary cursor-pointer" required />
              </div>
              <button type="submit" disabled={isUploading || !title || !file}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isUploading ? 'Saving…' : 'Save Memory'}
              </button>
            </form>
          </div>

          {/* Grid */}
          <div className="md:col-span-2">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold mb-4">Memories ({memories.length})</h2>
              {memories.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No memories yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {memories.map(m => (
                    <div key={m.id} className="relative group rounded-2xl overflow-hidden border border-border bg-background">
                      {m.images[0] ? (
                        <img src={m.images[0]} alt={m.title} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-muted flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-medium text-sm truncate">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.date}</p>
                      </div>
                      <button onClick={() => handleDelete(m.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-destructive text-white rounded-lg transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
