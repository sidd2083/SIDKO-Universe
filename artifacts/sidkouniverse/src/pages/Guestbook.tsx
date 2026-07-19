import { PageWrapper } from '@/components/layout/PageWrapper';
import { apiUrl } from '@/lib/apiBase';
import { Send, BookOpen, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface GuestEntry {
  id: string;
  name: string;
  message: string;
  location?: string;
  createdAt: string;
}

export default function Guestbook() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entries, setEntries] = useState<GuestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const load = () => {
    fetch(apiUrl('/api/guestbook'))
      .then(r => r.json())
      .then(data => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(apiUrl('/api/guestbook'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: message.trim(), location: location.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      setName(''); setMessage(''); setLocation('');
      setSent(true);
      load();
      setTimeout(() => setSent(false), 3000);
    } catch {
      toast({ title: 'Failed to sign guestbook. Try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Guestbook</span>
          </div>
          <h1 className="text-4xl font-black mb-3">Leave a note</h1>
          <p className="text-muted-foreground leading-relaxed">
            You stopped by. Say something — anything. I actually read these.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-6 mb-10 shadow-sm">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="text-center py-6">
                <div className="text-3xl mb-2">✍️</div>
                <p className="font-semibold text-foreground">Thanks for signing!</p>
                <p className="text-sm text-muted-foreground mt-1">Your note is now part of this page.</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Your name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} required maxLength={60}
                      placeholder="e.g. Rohan, Anonymous, etc."
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Where are you from?</label>
                    <input value={location} onChange={e => setLocation(e.target.value)} maxLength={80}
                      placeholder="City, Country"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Your message *</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} required maxLength={400}
                    placeholder="Say whatever's on your mind..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground text-sm leading-relaxed" />
                  <p className="text-xs text-muted-foreground text-right mt-1">{message.length}/400</p>
                </div>
                <button type="submit" disabled={isSubmitting || !name.trim() || !message.trim()}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Signing...' : 'Sign Guestbook'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Entries */}
        <div>
          <h2 className="text-xl font-bold mb-5">
            {entries.length > 0 ? `${entries.length} note${entries.length > 1 ? 's' : ''} left` : 'Notes'}
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-card border border-border rounded-2xl animate-pulse" />)}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted-foreground">
              <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>Be the first to leave a note.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, i) => (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{entry.name}</p>
                      {entry.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {entry.location}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{entry.message}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
