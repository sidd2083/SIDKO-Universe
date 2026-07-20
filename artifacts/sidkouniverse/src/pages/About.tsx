import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Globe, Camera, Brain, Database,
  MapPin, Rocket, GraduationCap, Layers,
  Dumbbell, Music, Flame, BookOpen, Cpu, ArrowUpRight, ChevronDown,
} from 'lucide-react';
import { Link } from 'wouter';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45, ease: 'easeOut' as const },
});

const skills = [
  { icon: Code2,    label: 'Full-Stack',       sub: 'React · Node.js · TypeScript · REST',    color: 'text-blue-400 bg-blue-400/10' },
  { icon: Brain,    label: 'AI / ML',           sub: 'Python · NumPy · Pandas. Still learning.', color: 'text-violet-400 bg-violet-400/10' },
  { icon: Layers,   label: 'UI & Design',       sub: 'Tailwind · Framer Motion · Figma',       color: 'text-pink-400 bg-pink-400/10' },
  { icon: Database, label: 'Databases',          sub: 'PostgreSQL · Firestore · Drizzle ORM',  color: 'text-green-400 bg-green-400/10' },
  { icon: Globe,    label: 'WordPress',          sub: 'Custom themes, plugins, architecture',  color: 'text-orange-400 bg-orange-400/10' },
  { icon: Camera,   label: 'Photo Editing',      sub: 'Lightroom · composition · retouching',  color: 'text-cyan-400 bg-cyan-400/10' },
];

const drinkIngredients = [
  { emoji: '🥛', name: 'Milk' },
  { emoji: '🌾', name: 'Oats' },
  { emoji: '🥜', name: 'Peanut butter' },
  { emoji: '🍯', name: 'Honey' },
  { emoji: '🌰', name: 'Almonds' },
  { emoji: '🍌', name: 'Banana' },
];

const timeline = [
  {
    time: '5:30 AM',
    emoji: '🏋️',
    label: 'Gym',
    note: 'Non-negotiable. Out the door at 5:30, no excuses.',
  },
  {
    time: '7:30 AM',
    emoji: '🏠',
    label: 'Back home — fuel up',
    note: 'High-protein shake + 2 eggs. Every single morning. The drink is always the same.',
    expandable: 'drink',
  },
  {
    time: '10:30 AM',
    emoji: '🎓',
    label: 'College',
    note: 'Hetauda School of Management. Science stream. Till 5:30 PM.',
  },
  {
    time: '5:30–6:30 PM',
    emoji: '🍱',
    label: 'Khaja time',
    note: 'Random snacks after college. Nothing consistent except it happens every day.',
  },
  {
    time: '6:30–7 PM',
    emoji: '📱',
    label: 'Mobile + reels',
    note: 'Decompress. Scroll. Exist. Not proud of it but it\'s real.',
  },
  {
    time: '7–8:30 PM',
    emoji: '📖',
    label: 'Homework',
    note: 'Complete whatever the teachers assigned. Get it done.',
  },
  {
    time: '8–9 PM',
    emoji: '🍽️',
    label: 'Dinner + mobile',
    note: 'Eat, reply to messages, exist with family.',
  },
  {
    time: '9–10:30 PM',
    emoji: '💻',
    label: 'Learning block',
    note: 'This is where I actually learn things — not school things. Real things.',
    link: '/learning',
  },
  {
    time: '11 PM–12 AM',
    emoji: '🧪',
    label: 'Physics or Chemistry',
    note: 'Late night study. Usually one of these two subjects. Brain works better at night.',
  },
  {
    time: '1–1:30 AM',
    emoji: '😴',
    label: 'Sleep',
    note: 'Before sleeping: scrolling, replying to messages, or just playing games. Then crash.',
  },
];

export default function About() {
  const [drinkOpen, setDrinkOpen] = useState(false);

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-8 space-y-16">

        {/* ── Hero ── */}
        <motion.div {...fade(0)}>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">About</p>
          <h1 className="text-[2.6rem] md:text-6xl font-black tracking-tight leading-[1.08] mb-6">
            I'm Siddhant.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-4">
            Grade 11. Hetauda, Nepal. I build things on the internet and try to figure out
            who I'm becoming while doing it.
          </p>
          <p className="text-base text-muted-foreground/80 leading-relaxed">
            This site is the real version of me, not the one curated for Instagram or a resume.
            It has my memories, my half-baked thoughts, music I'm obsessed with, and projects I'm
            actually working on. You're welcome to stay.
          </p>
        </motion.div>

        {/* ── The honest bit ── */}
        <motion.section {...fade(0.06)}>
          <div className="border-l-2 border-primary/40 pl-6 space-y-4 text-muted-foreground leading-relaxed">
            <p className="text-base">
              I'm not a good student academically. I'm not going to pretend otherwise. 
              Grades don't excite me. Building things does. I'd rather spend three hours 
              shipping a feature than memorizing something I'll forget in a week.
            </p>
            <p className="text-base">
              I get overwhelmed easily. I want to learn AI, math, physics, design, business — all of it,
              all at once. Most days I end up doing none of it properly. I start things and don't finish them.
              I have a folder called "ideas" with 200 notes in it. I've shipped maybe 5.
            </p>
            <p className="text-base">
              But I've built several real projects, including a freelancing and software website.
              I build things for clients, for friends, for problems I see around me.
              Not because I had to. Because I couldn't stop.
            </p>
            <p className="text-base">
              But I keep showing up. I built this site because I needed something that was
              <em className="text-foreground not-italic font-semibold"> mine</em>. No algorithm.
              No performance. Just me, documenting what's actually happening.
            </p>
            <p className="text-base">
              If you're 17 somewhere with a bunch of ideas and not enough time — this is proof you
              can build something real anyway. It won't be perfect. Ship it.
            </p>
          </div>
        </motion.section>

        {/* ── Right now ── */}
        <motion.section {...fade(0.1)}>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-5">Right now</h2>
          <div className="space-y-2">
            {[
              { icon: Rocket,        text: 'Building StudentHub Nepal',     sub: 'The project I think about at 2am' },
              { icon: Brain,         text: 'Going deep on AI & ML',          sub: 'Papers, code, a lot of confusion' },
              { icon: GraduationCap, text: 'Surviving Grade 11, Science',    sub: 'Hetauda School of Management' },
              { icon: Dumbbell,      text: 'Gym every morning',              sub: 'The one habit that stuck' },
              { icon: Cpu,           text: 'Learning to build AI products',  sub: 'Not just use them, build them' },
              { icon: Music,         text: 'Always listening to music',      sub: 'Literally always. Check the player.' },
            ].map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0">
                <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{text}</span>
                  <span className="text-xs text-muted-foreground ml-2 italic">{sub}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── What I'm building ── */}
        <motion.section {...fade(0.12)}>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-5">What I'm building</h2>
          <a href="https://studenthubnp.com" target="_blank" rel="noopener noreferrer">
            <motion.div
              whileHover={{ y: -3 }}
              className="group relative bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎓</span>
                  <div>
                    <p className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                      StudentHub Nepal
                    </p>
                    <span className="text-[10px] font-bold text-green-500 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Live
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Resources, notes, and peer collaboration for students across Nepal.
                I built the tool I wished existed when I started my +2 journey.
                It's not perfect. It's growing.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AI/ML'].map(t => (
                  <span key={t} className="text-[11px] font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-lg border border-border">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </a>
          <p className="text-xs text-muted-foreground mt-3 px-1">More in progress. I build in phases.</p>
        </motion.section>

        {/* ── Skills ── */}
        <motion.section {...fade(0.15)}>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-5">Things I can actually build with</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {skills.map((skill) => (
              <div key={skill.label} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${skill.color}`}>
                  <skill.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm leading-none mb-1">{skill.label}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{skill.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Day ── */}
        <motion.section {...fade(0.18)}>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-5">A typical day</h2>
          <div className="relative">
            <div className="absolute left-[22px] top-2 bottom-2 w-px bg-border" />
            <div className="space-y-1">
              {timeline.map((item) => (
                <div key={item.time} className="flex items-start gap-4 pl-1">
                  <div className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-lg shrink-0 relative z-10">
                    {item.emoji}
                  </div>
                  <div className="flex-1 pb-5 pt-1.5">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">{item.label}</span>
                      <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">{item.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.note}</p>

                    {/* Drink ingredients dropdown */}
                    {item.expandable === 'drink' && (
                      <div className="mt-2">
                        <button
                          onClick={() => setDrinkOpen(o => !o)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${drinkOpen ? 'rotate-180' : ''}`} />
                          {drinkOpen ? 'Hide ingredients' : "What's in the drink?"}
                        </button>
                        <AnimatePresence>
                          {drinkOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 flex flex-wrap gap-2">
                                {drinkIngredients.map(({ emoji, name }) => (
                                  <span
                                    key={name}
                                    className="inline-flex items-center gap-1.5 bg-primary/5 border border-primary/15 text-foreground px-2.5 py-1 rounded-lg text-xs font-medium"
                                  >
                                    {emoji} {name}
                                  </span>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Link to learning page */}
                    {item.link && (
                      <Link href={item.link}>
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-primary hover:underline cursor-pointer">
                          See what I'm learning →
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Quick facts ── */}
        <motion.section {...fade(0.2)}>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-5">Quick facts</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { icon: MapPin,        text: 'Hetauda, Bagmati Province, Nepal' },
              { icon: Code2,         text: 'React · Node.js · TypeScript' },
              { icon: Flame,         text: 'Obsessed with where AI is going' },
              { icon: BookOpen,      text: 'Currently: ML math + system design' },
              { icon: GraduationCap, text: 'Grade 11 · Science · HSM Hetauda' },
              { icon: Music,         text: 'Tea over coffee. Not negotiable.' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-card/50 border border-border/60 px-4 py-3 rounded-xl text-sm text-foreground">
                <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ── */}
        <motion.section {...fade(0.22)} className="pb-4">
          <div className="flex gap-3 flex-wrap">
            <Link href="/blog">
              <span className="text-sm font-semibold bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer inline-block">
                Read my writing
              </span>
            </Link>
            <Link href="/guestbook">
              <span className="text-sm font-medium bg-card border border-border text-muted-foreground px-5 py-2.5 rounded-xl hover:text-foreground hover:bg-muted transition-colors cursor-pointer inline-block">
                Leave a note
              </span>
            </Link>
          </div>
        </motion.section>

      </div>
    </PageWrapper>
  );
}
