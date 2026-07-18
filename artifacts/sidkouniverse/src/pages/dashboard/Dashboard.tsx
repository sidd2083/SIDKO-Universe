import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'wouter';
import { withAdminHeaders } from '@/lib/adminAuth';
import {
  Settings, Image as ImageIcon, BookOpen, MessageSquare,
  PenTool, Music, Clock, Target
} from 'lucide-react';
import { format } from 'date-fns';

interface Memory { id: string; title: string; images: string[]; date: string; category: string; }
interface Thought { id: string; title: string; content: string; mood: string; }
interface NglMessage { id: string; approved: boolean; }

export default function Dashboard() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAdmin) setLocation('/');
  }, [isAdmin, isLoading, setLocation]);

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch recent memories
    fetch('/api/memories')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMemories(data.slice(0, 4)); })
      .catch(() => {});

    // Fetch recent thoughts (all, including drafts)
    fetch('/api/thoughts/all', { headers: withAdminHeaders(), credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setThoughts(data.slice(0, 3)); })
      .catch(() => {});

    // Fetch pending NGL count
    fetch('/api/ngl/all', { headers: withAdminHeaders(), credentials: 'include' })
      .then(r => r.json())
      .then((data: NglMessage[]) => {
        if (Array.isArray(data)) setPendingCount(data.filter(m => !m.approved).length);
      })
      .catch(() => {});
  }, [isAdmin]);

  if (isLoading || !isAdmin) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const quickActions = [
    { label: 'Memories', icon: ImageIcon, path: '/dashboard/memories', color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Thoughts', icon: BookOpen, path: '/dashboard/thoughts', color: 'text-violet-500 bg-violet-500/10' },
    { label: 'Sid Philosophy', icon: PenTool, path: '/dashboard/blog', color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Timeline', icon: Clock, path: '/dashboard/timeline', color: 'text-cyan-500 bg-cyan-500/10' },
    { label: 'Goals', icon: Target, path: '/dashboard/goals', color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Anonymous', icon: MessageSquare, path: '/dashboard/anonymous', color: 'text-orange-500 bg-orange-500/10', badge: pendingCount || undefined },
    { label: 'Music', icon: Music, path: '/dashboard/music', color: 'text-pink-500 bg-pink-500/10' },
    { label: 'Settings', icon: Settings, path: '/dashboard/settings', color: 'text-slate-500 bg-slate-500/10' },
  ];

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto py-4 md:py-8">
        <div className="mb-10">
          <p className="text-muted-foreground text-sm mb-1">{greeting}, Siddhant 👋</p>
          <h1 className="text-3xl font-bold">Universe Dashboard</h1>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-12">
          {quickActions.map(action => (
            <Link key={action.path} href={action.path}>
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md hover:border-border/80 transition-all group relative aspect-square">
                {action.badge ? (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
                    {action.badge}
                  </span>
                ) : null}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-foreground leading-tight">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold">Recent Memories</h2>
              <Link href="/dashboard/memories" className="text-xs font-medium text-primary hover:underline">Manage</Link>
            </div>
            <div className="space-y-3">
              {memories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No memories yet.</p>
              ) : memories.map(m => (
                <div key={m.id} className="flex items-center gap-3 bg-background border border-border rounded-xl p-3">
                  <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                    {m.images?.[0] && <img src={m.images[0]} alt={m.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.date ? format(new Date(m.date), 'MMM d, yyyy') : ''}</p>
                  </div>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-medium shrink-0">{m.category}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold">Recent Thoughts</h2>
              <Link href="/dashboard/thoughts" className="text-xs font-medium text-primary hover:underline">Manage</Link>
            </div>
            <div className="space-y-3">
              {thoughts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No thoughts yet.</p>
              ) : thoughts.map(t => (
                <div key={t.id} className="bg-background border border-border rounded-xl p-4">
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className="font-semibold text-sm truncate">{t.title}</h3>
                    <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded ml-2 shrink-0">{t.mood}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{t.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
