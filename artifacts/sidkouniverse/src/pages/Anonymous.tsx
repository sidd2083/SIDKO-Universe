import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Send, MessageSquare, ShieldCheck, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface NglMessage {
  id: string;
  question: string;
  reply?: string;
  pinned: boolean;
  createdAt: string;
}

export default function Anonymous() {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [messages, setMessages] = useState<NglMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/ngl')
      .then(r => r.json())
      .then(data => { setMessages(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ngl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      setQuestion('');
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch {
      toast({ title: 'Failed to send. Try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sorted = [...messages].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Anonymous</span>
          </div>
          <h1 className="text-4xl font-black mb-3">Ask me anything</h1>
          <p className="text-muted-foreground leading-relaxed">
            Completely anonymous. I don't know who you are. Ask whatever's on your mind —
            I'll reply to the ones that feel worth answering.
          </p>
        </motion.div>

        {/* Submit form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-6 mb-10 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Your identity is completely hidden
          </div>
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="text-center py-6">
                <div className="text-3xl mb-2">🔒</div>
                <p className="font-semibold text-foreground">Sent anonymously.</p>
                <p className="text-sm text-muted-foreground mt-1">Siddhant has no idea it was you.</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="What's on your mind? Be real, be honest."
                  className="w-full bg-background border border-border rounded-xl p-4 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground text-sm leading-relaxed mb-4"
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{question.length}/500</span>
                  <button type="submit" disabled={isSubmitting || !question.trim()}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Sending...' : 'Send Anonymously'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Messages */}
        <div>
          <h2 className="text-xl font-bold mb-5">Answered Questions</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-28 bg-card border border-border rounded-2xl animate-pulse" />)}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>No answered questions yet. Ask something!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((msg, i) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={`bg-card border rounded-2xl p-5 ${msg.pinned ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                  {msg.pinned && (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 block">📌 Pinned</span>
                  )}
                  <p className="font-semibold text-foreground mb-3 leading-snug">"{msg.question}"</p>
                  {msg.reply && (
                    <div className="border-l-2 border-primary/30 pl-4 mt-3">
                      <p className="text-xs font-semibold text-primary mb-1">Sid's reply</p>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{msg.reply}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    {format(new Date(msg.createdAt), 'MMM d, yyyy')}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
