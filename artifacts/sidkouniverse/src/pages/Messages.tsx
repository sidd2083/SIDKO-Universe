import React, { useState, useEffect, useRef } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { db } from '@/lib/firebase';
import {
  collection, doc, addDoc, onSnapshot, serverTimestamp,
  setDoc, updateDoc, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  from: 'user' | 'admin';
  createdAt: string | Timestamp | null;
}

function formatTs(ts: string | Timestamp | null): string {
  if (!ts) return '';
  if (typeof ts === 'string') return format(new Date(ts), 'h:mm a');
  return format(ts.toDate(), 'h:mm a');
}

export default function Messages() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) setLocation('/login');
  }, [user, setLocation]);

  // Real-time listener on this user's message subcollection
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'conversations', user.uid, 'messages'),
      orderBy('createdAt', 'asc'),
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim() || sending) return;
    setSending(true);
    try {
      const convRef = doc(db, 'conversations', user.uid);
      const username = user.displayName || user.email?.split('@')[0] || 'Anonymous';

      // Ensure conversation doc exists
      await setDoc(convRef, {
        userId: user.uid,
        username,
        lastMessage: text.trim(),
        lastAt: serverTimestamp(),
        unread: true,
      }, { merge: true });

      // Add the message
      await addDoc(collection(db, 'conversations', user.uid, 'messages'), {
        text: text.trim(),
        from: 'user',
        createdAt: serverTimestamp(),
      });

      setText('');
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  const username = user.displayName || user.email?.split('@')[0] || 'You';

  return (
    <PageWrapper className="h-[calc(100dvh-8rem)] md:h-[calc(100dvh-4rem)]">
      <div className="bg-card border border-border rounded-3xl h-full flex flex-col overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
          <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
            S
          </div>
          <div>
            <p className="font-semibold text-sm">Siddhant</p>
            <p className="text-[11px] text-muted-foreground">Replies when he can 👋</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">Say hi to Siddhant!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start the conversation below.
              </p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={cn('flex', msg.from === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                    msg.from === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm',
                  )}
                >
                  <p>{msg.text}</p>
                  <p className={cn(
                    'text-[10px] mt-1 text-right',
                    msg.from === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground',
                  )}>
                    {formatTs(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="flex items-center gap-2 px-4 py-3 border-t border-border shrink-0">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Message Siddhant…"
            className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 hover:brightness-110 transition-all active:scale-95"
          >
            {sending
              ? <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
              : <Send className="w-4 h-4 text-primary-foreground" />}
          </button>
        </form>
      </div>
    </PageWrapper>
  );
}
