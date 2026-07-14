import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useFirestore } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/apiUpload';
import { Loader2, Upload, Trash2, GripVertical, Music } from 'lucide-react';

export default function MusicManager() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: tracks } = useFirestore<any>('music', []);

  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) setLocation('/');
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading || !isAdmin) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) return;
    if (!isFirebaseConfigured) {
      toast({ title: 'Firebase is not configured — track metadata cannot be saved yet.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      // Upload audio via API (no Firebase Storage needed)
      const url = await uploadFile(file);

      await addDoc(collection(db, 'music'), {
        title,
        url,
        coverImage: cover || '',
        order: tracks.length,
        createdAt: serverTimestamp(),
      });

      setTitle(''); setFile(null); setCover('');
      toast({ title: 'Track uploaded successfully' });
    } catch (err: any) {
      toast({ title: err?.message ?? 'Failed to upload track', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this track?')) return;
    try {
      await deleteDoc(doc(db, 'music', id));
      toast({ title: 'Track deleted' });
    } catch {
      toast({ title: 'Failed to delete track', variant: 'destructive' });
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Music Manager</h1>

        {!isFirebaseConfigured && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-sm">
            ⚠️ Firebase is not connected — audio files will upload, but track metadata needs Firebase to persist.
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <form onSubmit={handleUpload} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold mb-4">Add New Track</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Track Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Cover Image URL (Optional)</label>
                  <input type="url" value={cover} onChange={e => setCover(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    MP3 File <span className="text-primary">(direct upload)</span>
                  </label>
                  <input type="file" accept="audio/mp3,audio/mpeg"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    required />
                </div>
                <button type="submit" disabled={isUploading || !title || !file}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? 'Uploading...' : 'Upload Track'}
                </button>
              </div>
            </form>
          </div>

          <div className="md:col-span-2">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold mb-4">Playlist ({tracks.length})</h2>
              <div className="space-y-3">
                {tracks?.map((track: any) => (
                  <div key={track.id} className="flex items-center gap-3 bg-background border border-border rounded-xl p-3">
                    <div className="cursor-move text-muted-foreground hover:text-foreground p-1">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {track.coverImage ? (
                        <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{track.title}</p>
                    </div>
                    <button onClick={() => handleDelete(track.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {tracks?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">No tracks uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
