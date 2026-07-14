import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useFirestore } from '@/hooks/useFirestore';
import { MemoryCard, Memory } from '@/components/cards/MemoryCard';
import { ThoughtCard, Thought } from '@/components/cards/ThoughtCard';
import { GoalCard, Goal } from '@/components/cards/GoalCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { Link } from 'wouter';
import { ArrowRight, Github, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderBy, limit } from 'firebase/firestore';

interface SiteSettings {
  heroText: string;
  currentStatus: string;
  currentMood: string;
  currentGoal: string;
  statusEmoji: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  heroText: 'Building things, breaking stuff.',
  currentStatus: 'Coding something',
  currentMood: 'Focused',
  currentGoal: 'Ship StudentHub Nepal',
  statusEmoji: '💻',
};

/** Pick a status emoji based on keywords if the stored emoji is missing */
function inferEmoji(status: string, stored?: string): string {
  if (stored) return stored;
  const s = status.toLowerCase();
  if (/game|gaming|play/i.test(s)) return '🎮';
  if (/study|exam|read|learn/i.test(s)) return '📚';
  if (/gym|workout|train/i.test(s)) return '💪';
  if (/sleep|rest|nap/i.test(s)) return '😴';
  if (/music|listen/i.test(s)) return '🎵';
  if (/eat|food|lunch|dinner/i.test(s)) return '🍜';
  if (/friend|out|hang/i.test(s)) return '🤝';
  if (/ai|ml|build|code|dev|ship/i.test(s)) return '💻';
  return '🟢';
}

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch settings from API (no Firebase needed)
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((data: Partial<SiteSettings>) => {
        setSettings({ ...DEFAULT_SETTINGS, ...data });
        setSettingsLoaded(true);
      })
      .catch(() => setSettingsLoaded(true));
  }, []);

  const { data: memories, loading: memoriesLoading } = useFirestore<Memory>('memories', [
    orderBy('createdAt', 'desc'), limit(8),
  ]);
  const { data: thoughts, loading: thoughtsLoading } = useFirestore<Thought>('thoughts', [
    orderBy('createdAt', 'desc'), limit(4),
  ]);
  const { data: goals, loading: goalsLoading } = useFirestore<Goal>('goals', [
    orderBy('order', 'asc'), limit(3),
  ]);

  const emoji = inferEmoji(settings.currentStatus, settings.statusEmoji);

  return (
    <PageWrapper>
      {/* ── Live Status Banner ── */}
      <AnimatePresence>
        {settingsLoaded && settings.currentStatus && (
          <motion.div
            key="status-banner"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="mb-10 pt-8"
          >
            <div className="inline-flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow group">
              {/* Emoji with live dot */}
              <div className="relative shrink-0">
                <motion.span
                  className="text-2xl"
                  animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
                  transition={{ duration: 1.4, delay: 0.6, ease: 'easeInOut' }}
                >
                  {emoji}
                </motion.span>
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-card" />
                </span>
              </div>

              {/* Text */}
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-none mb-1">
                  Right now
                </p>
                <p className="font-semibold text-sm text-foreground leading-snug">
                  Siddhant is{' '}
                  <motion.span
                    key={settings.currentStatus}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-primary"
                  >
                    {settings.currentStatus.toLowerCase().replace(/^(at\s|a\s|the\s)/i, '')}
                  </motion.span>
                </p>
              </div>

              {/* Time badge */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-lg shrink-0 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Asia/Kathmandu',
                })}{' '}
                NPT
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero ── */}
      <section className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Hi, I'm Siddhant. <br />
            <span className="text-muted-foreground">{settings.heroText}</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Grade 11 student at Hetauda School of Management. Learning AI/ML. Building StudentHub Nepal.
            This is not a portfolio. It's a living record of my life.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <Link
              href="/about"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Explore My Universe
            </Link>
            <div className="sm:hidden text-sm text-muted-foreground bg-card border border-border px-4 py-2.5 rounded-xl">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Kathmandu',
              })}{' '}
              NPT
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Latest Memories ── */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Memories</h2>
          <Link href="/memories" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {memoriesLoading
            ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)
            : memories.length > 0
            ? memories.map(m => <MemoryCard key={m.id} memory={m} onClick={() => {}} />)
            : <div className="col-span-full text-center py-10 text-muted-foreground">No memories yet.</div>}
        </div>
      </section>

      {/* ── Thoughts + Goals ── */}
      <div className="grid md:grid-cols-2 gap-10 mb-16">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Thoughts</h2>
            <Link href="/thoughts" className="text-sm font-medium text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {thoughtsLoading
              ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
              : thoughts.length > 0
              ? thoughts.map(t => <ThoughtCard key={t.id} thought={t} />)
              : <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-2xl">No thoughts written yet.</div>}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Goals in Progress</h2>
          <div className="space-y-4">
            {goalsLoading
              ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
              : goals.length > 0
              ? goals.map(g => <GoalCard key={g.id} goal={g} />)
              : <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-2xl">No goals set yet.</div>}
          </div>
        </section>
      </div>

      {/* ── Current Focus ── */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Current Focus</h2>
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center shadow-sm"
        >
          <div className="w-full md:w-1/3 aspect-video md:aspect-square bg-muted rounded-2xl overflow-hidden shrink-0 flex items-center justify-center">
            <span className="text-4xl">🎓</span>
          </div>
          <div className="flex-1">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg mb-4">
              ACTIVE PROJECT
            </div>
            <h3 className="text-2xl font-bold mb-2">StudentHub Nepal</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              A platform connecting students across Nepal for resources, notes, and collaboration. Built to solve
              the exact problems I face as a Grade 11 student.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['React', 'Firebase', 'Tailwind', 'AI/ML'].map(tech => (
                <span key={tech} className="text-xs font-medium bg-muted px-2.5 py-1 rounded-md">{tech}</span>
              ))}
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
                <ExternalLink className="w-4 h-4" /> Visit Site
              </button>
              <button className="flex items-center gap-2 border border-border px-4 py-2 rounded-xl font-medium text-sm hover:bg-muted transition-colors">
                <Github className="w-4 h-4" /> GitHub
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
        <p>© {new Date().getFullYear()} Siddhant Lamichhane.</p>
        <div className="flex items-center gap-4">
          <span>Mood: {settings.currentMood}</span>
          <span>•</span>
          <span>Goal: {settings.currentGoal}</span>
        </div>
      </footer>
    </PageWrapper>
  );
}
