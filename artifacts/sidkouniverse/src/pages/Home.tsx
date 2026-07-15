import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useFirestore } from '@/hooks/useFirestore';
import { MemoryCard, Memory } from '@/components/cards/MemoryCard';
import { ThoughtCard, Thought } from '@/components/cards/ThoughtCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { Link } from 'wouter';
import { ArrowRight, Github, ExternalLink, Star, Zap, Globe, Mail } from 'lucide-react';
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
  heroText: 'Figuring life out, one day at a time.',
  currentStatus: 'Coding something',
  currentMood: 'Focused',
  currentGoal: 'Live a happy, meaningful life',
  statusEmoji: '💻',
};

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

const projects = [
  {
    name: 'StudentHub Nepal',
    emoji: '🎓',
    tag: 'FLAGSHIP PROJECT',
    tagColor: 'bg-primary/10 text-primary',
    description:
      'A platform connecting students across Nepal for resources, notes, and peer collaboration. Built to solve the exact problems I face as a Grade 11 student navigating the +2 journey.',
    stack: ['React', 'Node.js', 'TypeScript', 'AI/ML'],
    status: 'Active',
    liveUrl: 'https://studenthubnp.com' as string | null,
    githubUrl: null as string | null,
    featured: true,
  },
];

const stats = [
  { label: 'Projects Built', value: '10+', icon: Zap },
  { label: 'Grade', value: '11', icon: Star },
  { label: 'Based In', value: 'Nepal', icon: Globe },
];

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
            <div className="inline-flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
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
            Hi, I'm Siddhant.{' '}
            <span className="text-muted-foreground block mt-1">{settings.heroText}</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Grade 11 student in Hetauda, Nepal — learning to build real things, think more clearly,
            and document the messy, honest process of growing up.
          </p>
          <div className="flex flex-wrap gap-3 items-center mb-10">
            <Link
              href="/about"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm shadow-primary/20"
            >
              About Me
            </Link>
            <Link
              href="/blog"
              className="bg-card border border-border text-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-muted/60 transition-colors"
            >
              Read My Philosophy
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3">
            {stats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-card border border-border px-4 py-2.5 rounded-xl text-sm"
              >
                <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-bold text-foreground">{value}</span>
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
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

      {/* ── Recent Thoughts ── */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Thoughts</h2>
          <Link href="/thoughts" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {thoughtsLoading
            ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
            : thoughts.length > 0
            ? thoughts.map(t => <ThoughtCard key={t.id} thought={t} />)
            : (
              <div className="col-span-full text-center py-10 text-muted-foreground border border-dashed border-border rounded-2xl">
                No thoughts written yet.
              </div>
            )}
        </div>
      </section>

      {/* ── Projects ── */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Projects</h2>
        </div>

        <div className="space-y-4">
          {projects.map((project, i) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2 }}
              className="bg-card border border-border rounded-2xl p-6 md:p-7 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl shrink-0 border border-border">
                  {project.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${project.tagColor}`}>
                      {project.tag}
                    </span>
                    <span className="text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-md">
                      ● {project.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{project.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.stack.map(tech => (
                      <span key={tech} className="text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-md border border-border">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {project.liveUrl ? (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
                        <ExternalLink className="w-3.5 h-3.5" /> Visit Site
                      </a>
                    ) : null}
                    {project.githubUrl ? (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 border border-border px-4 py-2 rounded-xl font-medium text-sm hover:bg-muted transition-colors">
                        <Github className="w-3.5 h-3.5" /> GitHub
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="pt-10 pb-8 border-t border-border mt-4">
        {/* Quote */}
        <div className="mb-8 px-6 py-5 rounded-2xl bg-card border border-border">
          <p className="text-sm md:text-base text-foreground/80 italic leading-relaxed">
            "When something is important enough, you do it even if the odds are not in your favor."
          </p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">— Elon Musk</p>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: identity */}
          <div>
            <p className="font-semibold text-foreground mb-1">Siddhant Lamichhane</p>
            <p className="text-sm text-muted-foreground">
              Grade 11 · Hetauda, Nepal · Building things that matter.
            </p>
          </div>

          {/* Center: quick links */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {[
              { label: 'About', href: '/about' },
              { label: 'Philosophy', href: '/blog' },
              { label: 'Memories', href: '/memories' },
              { label: 'Guestbook', href: '/guestbook' },
              { label: 'NGL', href: '/anonymous' },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            ))}
          </div>

          {/* Right: live clock */}
          <div className="flex flex-col items-start md:items-end gap-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Kathmandu',
              })}{' '}
              NPT
            </span>
            <span>© {new Date().getFullYear()} Siddhant Lamichhane</span>
          </div>
        </div>
      </footer>
    </PageWrapper>
  );
}
