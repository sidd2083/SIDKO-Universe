import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useFirestore } from '@/hooks/useFirestore';
import { Skeleton } from '@/components/shared/Skeleton';
import { collection, addDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MapPin, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function Guestbook() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: entries, loading } = useFirestore<any>('guestbook', [
    orderBy('createdAt', 'desc')
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'guestbook'), {
        name: name.trim(),
        message: message.trim(),
        location: location.trim() || 'Planet Earth',
        createdAt: serverTimestamp()
      });
      setName('');
      setMessage('');
      setLocation('');
      toast({
        title: "Signed!",
        description: "Thanks for leaving a mark on my universe.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign guestbook.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-4 text-center flex items-center justify-center gap-3">
          <Globe className="w-8 h-8 text-primary" /> Guestbook
        </h1>
        <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
          Leave a message from wherever you are in the world. I'd love to know who's visiting my little corner of the internet.
        </p>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-12">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 ml-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 ml-1">Location (Optional)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Kathmandu, Nepal"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 ml-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hey Siddhant, really cool website!..."
                className="w-full bg-background border border-border rounded-xl p-4 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                required
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !message.trim()}
                className="bg-foreground text-background px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Signing...' : 'Sign Guestbook'}
              </button>
            </div>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6">Recent Signatures</h2>
          
          {loading ? (
            <div className="space-y-4">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
          ) : entries.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col h-full">
                  <p className="text-foreground text-sm flex-1 mb-4 italic">"{entry.message}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                    <div>
                      <p className="font-bold text-sm text-foreground">{entry.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {entry.location}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {entry.createdAt ? format(entry.createdAt.toDate(), 'MMM d, yyyy') : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-2xl">
              <p className="text-muted-foreground">No signatures yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}