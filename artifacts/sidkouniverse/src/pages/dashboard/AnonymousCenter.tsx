import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Check, Pin, Trash2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface NglMessage { id: string; question: string; approved: boolean; pinned: boolean; reply?: string; createdAt: string; }

export default function AnonymousCenter() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<NglMessage[]>([]);
  const [replies, setReplies] = useState<Record<string, string>>({});

  const load = () => {
    fetch('/api/ngl/all', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMessages(data); })
      .catch(() => {});
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) setLocation('/');
    else if (isAdmin) load();
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading || !isAdmin) return null;

  const patch = async (id: string, body: object) => {
    const res = await fetch(`/api/ngl/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed');
    load();
  };

  const handleApprove = async (id: string) => {
    const reply = replies[id] || '';
    try {
      await patch(id, { approved: true, reply });
      toast({ title: 'Approved & published' });
    } catch {
      toast({ title: 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await fetch(`/api/ngl/${id}`, { method: 'DELETE', credentials: 'include' });
      toast({ title: 'Deleted' });
      load();
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handlePin = async (id: string, pinned: boolean) => {
    try {
      await patch(id, { pinned: !pinned });
      toast({ title: pinned ? 'Unpinned' : 'Pinned' });
    } catch {
      toast({ title: 'Failed', variant: 'destructive' });
    }
  };

  const pending = messages.filter(m => !m.approved);
  const approved = messages.filter(m => m.approved);

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">NGL Center</h1>
          <div className="flex gap-3 text-sm">
            <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl font-medium">{pending.length} pending</span>
            <span className="bg-muted text-muted-foreground px-3 py-1.5 rounded-xl font-medium">{approved.length} published</span>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No anonymous messages yet.</p>
          </div>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4 text-primary">⏳ Pending Approval</h2>
            <div className="space-y-4">
              {pending.map(msg => (
                <div key={msg.id} className="bg-card border border-primary/30 bg-primary/5 rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-base font-medium">"{msg.question}"</p>
                    <button onClick={() => handleDelete(msg.id)}
                      className="p-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors ml-3 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{format(new Date(msg.createdAt), 'MMM d, yyyy · h:mm a')}</p>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Your reply (optional)</label>
                  <textarea
                    value={replies[msg.id] || ''}
                    onChange={e => setReplies(r => ({ ...r, [msg.id]: e.target.value }))}
                    placeholder="Write your public reply..."
                    className="w-full bg-background border border-border rounded-xl p-3 min-h-[90px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground text-sm mb-3"
                  />
                  <button onClick={() => handleApprove(msg.id)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
                    <Check className="w-4 h-4" /> Approve & Publish
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved */}
        {approved.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">✅ Published</h2>
            <div className="space-y-3">
              {approved.map(msg => (
                <div key={msg.id} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {msg.pinned && <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 block">📌 Pinned</span>}
                      <p className="font-medium text-foreground mb-1">"{msg.question}"</p>
                      {msg.reply && <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3 mt-2">{msg.reply}</p>}
                      <p className="text-xs text-muted-foreground mt-2">{format(new Date(msg.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handlePin(msg.id, msg.pinned)}
                        className={`p-2 rounded-xl transition-colors ${msg.pinned ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>
                        <Pin className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(msg.id)}
                        className="p-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
