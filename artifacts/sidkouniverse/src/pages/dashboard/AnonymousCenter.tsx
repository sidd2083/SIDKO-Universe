import React, { useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useFirestore } from '@/hooks/useFirestore';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Pin, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AnonymousCenter() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: messages } = useFirestore<any>('anonymous_messages', [orderBy('createdAt', 'desc')]);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      setLocation('/');
    }
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading || !isAdmin) return null;

  const handleApprove = async (id: string, reply: string) => {
    if (!reply.trim()) {
      toast({ title: 'Please provide a reply before approving', variant: 'destructive' });
      return;
    }
    try {
      await updateDoc(doc(db, 'anonymous_messages', id), { approved: true, reply });
      toast({ title: 'Message approved and published' });
    } catch (err) {
      toast({ title: 'Failed to approve message', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteDoc(doc(db, 'anonymous_messages', id));
      toast({ title: 'Message deleted' });
    } catch (err) {
      toast({ title: 'Failed to delete message', variant: 'destructive' });
    }
  };

  const handleTogglePin = async (id: string, currentPin: boolean) => {
    try {
      await updateDoc(doc(db, 'anonymous_messages', id), { pinned: !currentPin });
      toast({ title: currentPin ? 'Message unpinned' : 'Message pinned' });
    } catch (err) {
      toast({ title: 'Failed to update pin status', variant: 'destructive' });
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Anonymous Messages Center</h1>

        <div className="space-y-6">
          {messages?.map(msg => (
            <div key={msg.id} className={`bg-card border rounded-3xl p-6 shadow-sm ${msg.approved ? 'border-border' : 'border-primary/50 bg-primary/5'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${msg.approved ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
                    {msg.approved ? 'Published' : 'Pending'}
                  </span>
                  <p className="text-sm text-muted-foreground mb-1">{msg.createdAt ? format(msg.createdAt.toDate(), 'MMM d, yyyy • h:mm a') : ''}</p>
                  <p className="text-xl font-medium">"{msg.question}"</p>
                </div>
                <div className="flex items-center gap-2">
                  {msg.approved && (
                    <button onClick={() => handleTogglePin(msg.id, msg.pinned)} className={`p-2 rounded-lg transition-colors ${msg.pinned ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>
                      <Pin className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(msg.id)} className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!msg.approved ? (
                <div className="mt-4 pt-4 border-t border-border">
                  <label className="block text-sm font-medium mb-2 text-primary">Write your reply</label>
                  <textarea
                    id={`reply-${msg.id}`}
                    className="w-full bg-background border border-border rounded-xl p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground mb-3"
                    placeholder="Your public response..."
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById(`reply-${msg.id}`) as HTMLTextAreaElement;
                      handleApprove(msg.id, el.value);
                    }}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity"
                  >
                    <Check className="w-4 h-4" /> Approve & Publish
                  </button>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-bold mb-1">Your Reply:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.reply}</p>
                </div>
              )}
            </div>
          ))}
          {messages?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-3xl">
              No anonymous messages yet.
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}