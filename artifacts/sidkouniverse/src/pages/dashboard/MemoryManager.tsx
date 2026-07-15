import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/apiUpload';
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
    fetch('/api/memories')
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
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      if (!res.ok) throw new Error('Failed');
      setTitle(''); setDescription(''); setFile(null); setTags(''); setLocationStr('');
      toast({ title: '📸 Memory saved!' });
      load();
    } catch {
      toast({ title: 'Failed to upload memory', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memory?')) return;
    try {
      await fetch(`/api/memories/${id}`, { method: 'DELETE', credentials: 'include' });
      toast({ title: 'Deleted' }); load();
    } catch { toast({ title: 'Failed to delete', variant: 'destructive' }); }
  };

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Memory Manager</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleUpload} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-xl mb-2">Upload Memory</h2>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Photo *</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required
                  className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground text-sm min-h-[80px] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none text-foreground">
                    {['Life', 'Gym', 'College', 'Friends', 'Family', 'Coding', 'Travel', 'Food'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mood</label>
                  <select value={mood} onChange={e => setMood(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none text-foreground">
                    {['Happy', 'Nostalgic', 'Excited', 'Grateful', 'Proud', 'Chill'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none text-foreground text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Location</label>
                <input type="text" value={locationStr} onChange={e => setLocationStr(e.target.value)} placeholder="Hetauda, Nepal"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tags (comma separated)</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="gym, friends, ..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground text-sm" />
              </div>
              <button type="submit" disabled={isUploading || !title || !file}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {isUploading ? 'Uploading...' : 'Save Memory'}
              </button>
            </form>
          </div>

          {/* Grid */}
          <div className="lg:col-span-2">
            {memories.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-2xl">
                <ImageIcon className="w-10 h-10 mb-3 opacity-30" />
                <p>No memories yet. Upload the first one!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {memories.map(m => (
                  <div key={m.id} className="bg-card border border-border rounded-2xl overflow-hidden group">
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      {m.images?.[0]
                        ? <img src={m.images[0]} alt={m.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground" /></div>}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => handleDelete(m.id)}
                          className="bg-destructive text-destructive-foreground p-3 rounded-full hover:scale-110 transition-transform">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.category} · {m.date?.slice(0, 10)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
