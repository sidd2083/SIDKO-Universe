import { useState, useEffect, useCallback, useRef } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { apiUrl } from '@/lib/apiBase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { withAdminHeaders } from '@/lib/adminAuth';
import { Loader2, Trash2, Music2, Link as LinkIcon, ExternalLink, Upload, X } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  url: string;
  coverImage?: string;
  order: number;
}

type AddMode = 'url' | 'file';

export default function MusicManager() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [addMode, setAddMode] = useState<AddMode>('file');

  // URL mode
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [cover, setCover] = useState('');

  // File mode
  const [fileTitle, setFileTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  /** Add track via URL */
  const handleAddUrl = async (e: React.FormEvent) => {
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

  /** Add track via file upload */
  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileTitle.trim() || !selectedFile) return;
    setIsSaving(true);
    try {
      const form = new FormData();
      form.append('title', fileTitle.trim());
      form.append('file', selectedFile);

      const res = await fetch(apiUrl('/api/music/upload'), {
        method: 'POST',
        headers: withAdminHeaders(),
        credentials: 'include',
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? 'Upload failed');
      }
      setFileTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast({ title: '🎵 Track uploaded!' });
      fetchTracks();
    } catch (err: any) {
      toast({ title: err?.message ?? 'Upload failed', variant: 'destructive' });
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
          Upload MP3 files from your computer, or paste a direct audio URL.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Add form */}
          <div className="md:col-span-1 space-y-3">
            {/* Mode toggle */}
            <div className="flex rounded-xl overflow-hidden border border-border">
              <button
                onClick={() => setAddMode('file')}
                className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  addMode === 'file' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>
              <button
                onClick={() => setAddMode('url')}
                className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  addMode === 'url' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" /> Paste URL
              </button>
            </div>

            {addMode === 'file' ? (
              <form onSubmit={handleAddFile} className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold">Upload from File</h2>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Track Title *</label>
                  <input
                    type="text"
                    value={fileTitle}
                    onChange={e => setFileTitle(e.target.value)}
                    placeholder="e.g. Blinding Lights"
                    required
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Audio File * <span className="text-primary">(MP3, WAV, OGG, M4A)</span></label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    {selectedFile ? (
                      <div className="flex items-center gap-2">
                        <Music2 className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-xs text-foreground truncate flex-1 text-left">{selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Click to choose a file</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">Max 30 MB</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
                      className="hidden"
                      onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving || !fileTitle.trim() || !selectedFile}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isSaving ? 'Uploading…' : 'Upload Track'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAddUrl} className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold">Add via URL</h2>

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
            )}
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
                  <p className="text-sm">No tracks yet. Upload a file or add a URL.</p>
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
