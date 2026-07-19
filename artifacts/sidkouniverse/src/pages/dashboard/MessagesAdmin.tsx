import React, { useState, useEffect, useRef } from 'react';
import { withAdminHeaders } from '@/lib/adminAuth';
import { apiUrl } from '@/lib/apiBase';
import { Send, Loader2, MessageCircle, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Convo {
  id: string;
  userId: string;
  username: string;
  lastMessage: string;
  lastAt: { seconds: number } | null;
  unread: boolean;
}

interface Msg {
  id: string;
  text: string;
  from: 'user' | 'admin';
  createdAt: string;
}

function formatTime(ts: { seconds: number } | null | string): string {
  if (!ts) return '';
  const date = typeof ts === 'string' ? new Date(ts) : new Date((ts as any).seconds * 1000);
  return format(date, 'MMM d, h:mm a');
}

export default function MessagesAdmin() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Convo | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchConvos = async () => {
    try {
      const r = await fetch(apiUrl('/api/conversations'), { headers: withAdminHeaders() });
      const data = await r.json();
      if (Array.isArray(data)) setConvos(data as Convo[]);
    } catch {} finally { setLoading(false); }
  };

  const fetchMsgs = async (userId: string) => {
    setMsgsLoading(true);
    try {
      const r = await fetch(apiUrl(`/api/conversations/${userId}/messages`), { headers: withAdminHeaders() });
      const data = await r.json();
      if (Array.isArray(data)) setMsgs(data as Msg[]);
    } catch {} finally { setMsgsLoading(false); }
    // Mark as read
    await fetch(apiUrl(`/api/conversations/${userId}`), { method: 'PATCH', headers: withAdminHeaders() });
    setConvos(prev => prev.map(c => c.userId === userId ? { ...c, unread: false } : c));
  };

  useEffect(() => { fetchConvos(); }, []);

  useEffect(() => {
    if (selected) fetchMsgs(selected.userId);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !reply.trim() || sending) return;
    setSending(true);
    try {
      const r = await fetch(apiUrl(`/api/conversations/${selected.userId}/messages`), {
        method: 'POST',
        headers: { ...withAdminHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply.trim() }),
      });
      const msg = await r.json();
      setMsgs(prev => [...prev, msg as Msg]);
      setReply('');
      setConvos(prev => prev.map(c =>
        c.userId === selected.userId ? { ...c, lastMessage: reply.trim() } : c
      ));
    } catch {} finally { setSending(false); }
  };

  return (
    <div className="bg-card border border-border rounded-3xl flex overflow-hidden shadow-sm" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Sidebar — convos list */}
      <div className={cn(
        "flex flex-col border-r border-border",
        selected ? "hidden md:flex w-72" : "flex w-full md:w-72"
      )}>
        <div className="px-4 py-4 border-b border-border">
          <h2 className="font-bold text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            DMs
            {convos.filter(c => c.unread).length > 0 && (
              <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                {convos.filter(c => c.unread).length}
              </span>
            )}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
          ) : convos.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No messages yet</p>
          ) : convos.map(c => (
            <button
              key={c.userId}
              onClick={() => setSelected(c)}
              className={cn(
                "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/40",
                selected?.userId === c.userId && "bg-primary/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {c.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={cn("text-sm font-medium truncate", c.unread && "font-bold")}>{c.username}</p>
                    {c.unread && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.lastMessage || '—'}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {selected ? (
        <div className={cn("flex-1 flex flex-col", !selected && "hidden md:flex")}>
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border shrink-0">
            <button onClick={() => setSelected(null)} className="md:hidden p-1 rounded-lg hover:bg-muted">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {selected.username?.[0]?.toUpperCase()}
            </div>
            <p className="font-semibold text-sm">{selected.username}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {msgsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
            ) : msgs.map(msg => (
              <div key={msg.id} className={cn('flex', msg.from === 'admin' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                  msg.from === 'admin'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm',
                )}>
                  <p>{msg.text}</p>
                  <p className={cn(
                    'text-[10px] mt-1 text-right',
                    msg.from === 'admin' ? 'text-primary-foreground/60' : 'text-muted-foreground',
                  )}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Reply input */}
          <form onSubmit={sendReply} className="flex items-center gap-2 px-4 py-3 border-t border-border shrink-0">
            <input
              type="text"
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder={`Reply to ${selected.username}…`}
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!reply.trim() || sending}
              className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 hover:brightness-110 transition-all"
            >
              {sending
                ? <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                : <Send className="w-4 h-4 text-primary-foreground" />}
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-center">
          <div>
            <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Select a conversation</p>
            <p className="text-sm text-muted-foreground mt-1">Pick from the list on the left</p>
          </div>
        </div>
      )}
    </div>
  );
}
