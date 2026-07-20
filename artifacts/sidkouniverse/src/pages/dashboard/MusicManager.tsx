import { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { apiUrl } from '@/lib/apiBase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { withAdminHeaders } from '@/lib/adminAuth';
import { Loader2, Trash2, Music2, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  url: string;
  coverImage?: string;
  order: number;
}

export default function MusicManager() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [cover, setCover] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) setLocation('/');
  }, [isAdmin, isLoading, setLocation]);

  const fetchTracks = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/music'), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setTracks(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: 'Could not load tracks', variant: 'destructive' });
    } finally {
      setTracksLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAdmin) fetchTracks();
  }, [isAdmin, fetchTracks]);

  if (isLoading || !isAdmin) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(apiUrl('/api/music'), {
        method: 'POST',
        headers: withAdminHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ title: title.trim(), url: url.trim(), coverImage: cover.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? 'Failed to add track');
      }
      setTitle(''); setUrl(''); setCover('');
      toast({ title: '🎵 Track added!' });
      fetchTracks();
    } catch (err: any) {
      toast({ title: err?.message ?? 'Failed to add track', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this track?')) return;
    try {
      const res = await fetch(apiUrl(`/api/music/${id}`), {
        method: 'DELETE',
        headers: withAdminHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Delete failed');
      toast({ title: 'Track deleted' });
      fetchTracks();
    } catch {
      toast({ title: 'Failed to delete track', variant: 'destructive' });
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Music Manager</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Paste a direct audio URL (MP3, OGG, WAV). Works from any host — Google Drive, Dropbox, SoundCloud, etc.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Add form */}
          <div className="md:col-span-1">
            <form onSubmit={handleAdd} className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold">Add Track</h2>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Track Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Blinding Lights"
                  required
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Audio URL * <span className="text-primary">(direct .mp3 link)</span>
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://..."
                  required
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  Need a free host? Upload to{' '}
                  <a href="https://drive.google.com" target="_blank" rel="noopener" className="text-primary underline">Google Drive</a>
                  {' '}→ Share → "Anyone with link" → use a direct link converter.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Cover Image URL (optional)</label>
                <input
                  type="url"
                  value={cover}
                  onChange={e => setCover(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving || !title.trim() || !url.trim()}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                {isSaving ? 'Saving…' : 'Add Track'}
              </button>
            </form>
          </div>

          {/* Playlist */}
          <div className="md:col-span-2">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold mb-4">
                Playlist {tracksLoading ? '' : `(${tracks.length})`}
              </h2>

              {tracksLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : tracks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Music2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No tracks yet. Add one with a URL.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tracks.map((track) => (
                    <div key={track.id} className="flex items-center gap-4 bg-background border border-border rounded-2xl px-4 py-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {track.coverImage
                          ? <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                          : <Music2 className="w-4 h-4 text-primary" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{track.title}</p>
                        <a
                          href={track.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors truncate mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{track.url}</span>
                        </a>
                      </div>
                      <button
                        onClick={() => handleDelete(track.id)}
                        className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
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
