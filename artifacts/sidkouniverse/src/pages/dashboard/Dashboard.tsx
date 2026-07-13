import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useFirestore } from '@/hooks/useFirestore';
import { Memory } from '@/components/cards/MemoryCard';
import { Thought } from '@/components/cards/ThoughtCard';
import { Link } from 'wouter';
import { Settings, Image as ImageIcon, BookOpen, MessageSquare, PenTool, Music } from 'lucide-react';
import { orderBy, limit, where } from 'firebase/firestore';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: memories } = useFirestore<Memory>('memories', [orderBy('createdAt', 'desc'), limit(4)]);
  const { data: thoughts } = useFirestore<Thought>('thoughts', [orderBy('createdAt', 'desc'), limit(3)]);
  const { data: pendingAnonymous } = useFirestore<any>('anonymous_messages', [where('approved', '==', false)]);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      setLocation('/');
    }
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading || !isAdmin) return null;

  const quickActions = [
    { label: 'Manage Memories', icon: ImageIcon, path: '/dashboard/memories', color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Write Thought', icon: BookOpen, path: '/dashboard/thoughts', color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Write Blog', icon: PenTool, path: '/dashboard/blog', color: 'text-green-500 bg-green-500/10' },
    { label: 'Anonymous Msgs', icon: MessageSquare, path: '/dashboard/anonymous', color: 'text-orange-500 bg-orange-500/10', badge: pendingAnonymous?.length },
    { label: 'Music Manager', icon: Music, path: '/dashboard/music', color: 'text-pink-500 bg-pink-500/10' },
    { label: 'Site Settings', icon: Settings, path: '/dashboard/settings', color: 'text-gray-500 bg-gray-500/10' },
  ];

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto py-4 md:py-8">
        <h1 className="text-3xl font-bold mb-2">Universe Dashboard</h1>
        <p className="text-muted-foreground mb-10">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, Siddhant 👋
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {quickActions.map(action => (
            <Link key={action.path} href={action.path}>
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 hover:shadow-sm transition-all group relative">
                {action.badge ? (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center font-bold">
                    {action.badge}
                  </span>
                ) : null}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-foreground">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Recent Memories</h2>
              <Link href="/dashboard/memories" className="text-sm font-medium text-primary hover:underline">Manage</Link>
            </div>
            <div className="space-y-4">
              {memories?.map(m => (
                <div key={m.id} className="flex items-center gap-4 bg-background border border-border rounded-xl p-3">
                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                    {m.images?.[0] && <img src={m.images[0]} alt={m.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.date ? format(new Date(m.date), 'MMM d, yyyy') : ''}</p>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded font-medium">{m.category}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Recent Thoughts</h2>
              <Link href="/dashboard/thoughts" className="text-sm font-medium text-primary hover:underline">Manage</Link>
            </div>
            <div className="space-y-4">
              {thoughts?.map(t => (
                <div key={t.id} className="bg-background border border-border rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm truncate">{t.title}</h3>
                    <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{t.mood}</span>
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