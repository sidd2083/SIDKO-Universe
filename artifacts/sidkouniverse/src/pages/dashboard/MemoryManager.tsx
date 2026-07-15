import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { isFirebaseConfigured } from '@/lib/firebase';
import { orderBy } from 'firebase/firestore';
import { addFirestoreDoc, deleteFirestoreDoc, SERVER_TIMESTAMP } from '@/lib/firestoreApi';
import { useFirestore } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/apiUpload';
import { Loader2, Upload, Trash2 } from 'lucide-react';

export default function MemoryManager() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: memories } = useFirestore<any>('memories', [orderBy('createdAt', 'desc')]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Life');
  const [mood, setMood] = useState('Happy');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationStr, setLocationStr] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) setLocation('/');
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading || !isAdmin) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) return;
    if (!isFirebaseConfigured) {
      toast({ title: 'Firebase is not configured — memories cannot be saved yet.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      // Upload image via API (no Firebase Storage needed)
      const url = await uploadFile(file);

      await addFirestoreDoc('memories', {
        title,
        description,
        images: [url],
        category,
        mood,
        date: new Date(date).toISOString(),
        location: locationStr,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        featured: false,
        pinned: false,
        likesCount: 0,
        commentsCount: 0,
        visibility: 'public',
        createdAt: SERVER_TIMESTAMP,
      });

      setTitle(''); setDescription(''); setFile(null);
      setTags(''); setLocationStr('');
      toast({ title: 'Memory uploaded successfully' });
    } catch (err: any) {
      toast({ title: err?.message ?? 'Failed to upload memory', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memory?')) return;
    try {
      await deleteFirestoreDoc('memories', id);
      toast({ title: 'Memory deleted' });
    } catch {
      toast({ title: 'Failed to delete memory', variant: 'destructive' });
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Memory Manager</h1>

        {!isFirebaseConfigured && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-sm">
            ⚠️ Firebase is not connected — images will upload fine, but the memory record needs Firebase to be saved.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <form onSubmit={handleUpload} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold mb-6 text-xl">Upload Memory</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Image <span className="text-primary">(direct upload — no Firebase)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground min-h-[100px] resize-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground">
                      {['Life', 'Gym', 'College', 'Friends', 'Family', 'Coding', 'Travel'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Location</label>
                  <input type="text" value={locationStr} onChange={e => setLocationStr(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Tags (comma separated)</label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground" />
                </div>
                
                <button type="submit" disabled={isUploading || !title || !file}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {isUploading ? 'Uploading...' : 'Upload Memory'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memories?.map((m: any) => (
                <div key={m.id} className="bg-card border border-border rounded-2xl overflow-hidden group">
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {m.images?.[0] && <img src={m.images[0]} alt={m.title} className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => handleDelete(m.id)}
                        className="bg-destructive text-destructive-foreground p-3 rounded-full hover:scale-110 transition-transform">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.category}</p>
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
