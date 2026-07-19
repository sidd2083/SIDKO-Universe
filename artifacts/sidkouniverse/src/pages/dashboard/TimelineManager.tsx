import { PageWrapper } from '@/components/layout/PageWrapper';
import { apiUrl } from '@/lib/apiBase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { withAdminHeaders } from '@/lib/adminAuth';
import { Plus, Trash2, Star, Pencil, X, Check, Loader2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  year: string;
  category: 'milestone' | 'achievement' | 'memory' | 'project' | 'other';
  location?: string;
  highlight?: boolean;
  emoji?: string;
  createdAt: string;
}

const CATEGORIES = ['milestone', 'achievement', 'memory', 'project', 'other'] as const;

const emptyForm = {
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  category: 'milestone' as TimelineEvent['category'],
  location: '',
  emoji: '',
  highlight: false,
};

export default function TimelineManager() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  if (!isLoading && !isAdmin) { setLocation('/'); return null; }
  if (isLoading || !isAdmin) return null;

  const fetchEvents = async () => {
    try {
      const res = await fetch(apiUrl('/api/timeline'));
      if (!res.ok) throw new Error();
      setEvents(await res.json());
    } catch {
      toast({ title: 'Failed to load timeline', variant: 'destructive' });
    } finally {
      setEventsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => { if (isAdmin) fetchEvents(); }, [isAdmin]);

  const resetForm = () => { setForm({ ...emptyForm }); setEditingId(null); setShowForm(false); };

  const openEdit = (ev: TimelineEvent) => {
    setForm({
      title: ev.title,
      description: ev.description || '',
      date: ev.date,
      category: ev.category,
      location: ev.location || '',
      emoji: ev.emoji || '',
      highlight: ev.highlight || false,
    });
    setEditingId(ev.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/timeline/${editingId}`, {
          method: 'PATCH',
          headers: withAdminHeaders({ 'Content-Type': 'application/json' }),
          credentials: 'include',
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast({ title: 'Event updated' });
      } else {
        const res = await fetch(apiUrl('/api/timeline'), {
          method: 'POST',
          headers: withAdminHeaders({ 'Content-Type': 'application/json' }),
          credentials: 'include',
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast({ title: 'Event added' });
      }
      resetForm();
      fetchEvents();
    } catch {
      toast({ title: 'Error saving event', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await fetch(`/api/timeline/${id}`, { method: 'DELETE', headers: withAdminHeaders(), credentials: 'include' });
      toast({ title: 'Event deleted' });
      fetchEvents();
    } catch {
      toast({ title: 'Error deleting event', variant: 'destructive' });
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-4 md:py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Timeline Manager</h1>
            <p className="text-muted-foreground text-sm mt-1">{events.length} event{events.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:brightness-110 transition-all">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold">{editingId ? 'Edit Event' : 'New Event'}</h2>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title *</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="e.g. Started Grade 11" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date *</label>
                    <input type="date" value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                    placeholder="What happened?" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as TimelineEvent['category'] }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 capitalize">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Location</label>
                    <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Nepal, Hetauda..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Emoji</label>
                    <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="🎓" maxLength={4} />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.highlight} onChange={e => setForm(f => ({ ...f, highlight: e.target.checked }))}
                    className="w-4 h-4 rounded accent-primary" />
                  <span className="text-sm flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-500" /> Mark as highlight
                  </span>
                </label>
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:brightness-110 transition-all disabled:opacity-60">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {editingId ? 'Update' : 'Add Event'}
                  </button>
                  <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {eventsLoading ? (
          <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />)}</div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-2xl">
            <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No timeline events yet. Add your first one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <motion.div key={ev.id} layout className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <div className="text-xl w-8 text-center shrink-0">{ev.emoji || '📌'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{ev.title}</p>
                    {ev.highlight && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />}
                    <span className="text-xs capitalize bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{ev.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(ev.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    {ev.location ? ` · ${ev.location}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(ev)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(ev.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
