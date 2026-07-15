import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { motion } from 'framer-motion';
import {
  Code2, Globe, Camera, Brain, Database,
  MapPin, Coffee, Rocket, GraduationCap, Layers,
  Dumbbell, Music, Flame, BookOpen, Cpu,
} from 'lucide-react';
import { Link } from 'wouter';

const skills = [
  { icon: Code2,    label: 'Full-Stack Web Dev',   desc: 'React, Node.js, TypeScript, REST APIs, Express' },
  { icon: Brain,    label: 'AI / Machine Learning', desc: 'Python, NumPy, Pandas. Deep in the rabbit hole.' },
  { icon: Layers,   label: 'UI & Design Systems',   desc: 'Tailwind CSS, Framer Motion, component design' },
  { icon: Database, label: 'Databases & APIs',       desc: 'PostgreSQL, Drizzle ORM, REST API design' },
  { icon: Globe,    label: 'WordPress',              desc: 'Custom themes, plugins, site architecture' },
  { icon: Camera,   label: 'Photo Editing',          desc: 'Lightroom, composition, retouching' },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

export default function About() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-8 space-y-14">

        {/* ── Hero ── */}
        <motion.div {...fade(0)}>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">About Me</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-5 leading-tight">
            I'm Siddhant.<br />
            <span className="text-muted-foreground font-semibold text-3xl md:text-4xl">
              I build things and figure out the rest as I go.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Grade 11 student from Hetauda, Nepal. I spend most of my time writing code,
            thinking about ideas, and trying to become someone worth becoming. This site
            is my living proof that I existed and actually tried.
          </p>
        </motion.div>

        {/* ── Right now ── */}
        <motion.section {...fade(0.05)}>
          <h2 className="text-xl font-bold mb-4">Right now</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: Rocket,       text: 'Building StudentHub Nepal',         sub: 'My biggest project yet' },
              { icon: Brain,        text: 'Going deep on AI & ML',              sub: 'Papers, code, experiments' },
              { icon: GraduationCap,text: 'Surviving Grade 11',                sub: 'HSM, Hetauda' },
              { icon: Dumbbell,     text: 'Hitting the gym daily',             sub: 'Consistency > motivation' },
              { icon: Music,        text: 'Always listening to music',         sub: 'Literally always' },
              { icon: Cpu,          text: 'Learning to build AI products',     sub: 'Not just use them' },
            ].map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex items-start gap-3 bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-shadow">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── The honest version ── */}
        <motion.section {...fade(0.1)}>
          <h2 className="text-xl font-bold mb-4">The honest version</h2>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 text-muted-foreground leading-relaxed text-sm">
            <p>
              I'm not the type who has everything figured out. I get overwhelmed. I procrastinate.
              I start things and don't finish them. I want to learn everything: AI, math, physics,
              business, design. And end up doing none of it properly some days.
            </p>
            <p>
              But I keep showing up. I built this site not to show off, but because I needed a place
              that was <em className="text-foreground font-medium">mine</em>. No algorithm, no likes
              count, no performance. Just me, writing and building in public, figuring out who I'm
              becoming.
            </p>
            <p>
              If you're a 17-year-old somewhere trying to build something real with limited resources
              and too many ideas. This site is proof that you can start anyway.
            </p>
          </div>
        </motion.section>

        {/* ── What I'm building ── */}
        <motion.section {...fade(0.12)}>
          <h2 className="text-xl font-bold mb-4">What I'm Building</h2>
          <Link href="https://studenthubnp.com" target="_blank" rel="noopener noreferrer">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-2xl shrink-0">
                  🎓
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                      StudentHub Nepal
                    </p>
                    <span className="text-[10px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-md">
                      ● LIVE
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    A platform for students across Nepal: resources, notes, and peer collaboration.
                    I built the tool I wished existed when I started my +2 journey. It's not perfect.
                    It's alive. And it's growing.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AI/ML'].map(t => (
                      <span key={t} className="text-[11px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-md border border-border">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
          <p className="text-sm text-muted-foreground mt-3 px-1">
            More projects coming. I build in phases. StudentHub is the big one right now.
          </p>
        </motion.section>

        {/* ── Skills ── */}
        <motion.section {...fade(0.15)}>
          <h2 className="text-xl font-bold mb-2">Skills</h2>
          <p className="text-sm text-muted-foreground mb-5">Things I can actually build with. Not buzzwords.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {skills.map((skill) => (
              <motion.div
                key={skill.label}
                whileHover={{ y: -2 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3 hover:shadow-sm transition-shadow"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <skill.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{skill.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{skill.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── A day in my life ── */}
        <motion.section {...fade(0.18)}>
          <h2 className="text-xl font-bold mb-4">A day in my life</h2>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="space-y-3">
              {[
                { time: 'Early morning', label: '🏋️‍♂️ Gym', note: 'Non-negotiable. Sets the tone.' },
                { time: 'Morning',       label: '📚 College', note: 'Hetauda School of Management' },
                { time: 'Afternoon',     label: '🧠 Deep work', note: 'Reading, building, thinking' },
                { time: 'Evening',       label: '💻 Project time', note: 'Mostly StudentHub + experiments' },
                { time: 'Night',         label: '🎵 Music + wind down', note: 'Some journaling, some overthinking' },
              ].map(({ time, label, note }) => (
                <div key={time} className="flex items-center gap-4">
                  <span className="text-[10px] font-semibold text-muted-foreground w-20 shrink-0 uppercase tracking-wide">{time}</span>
                  <div className="flex-1 flex items-center gap-3 bg-background border border-border px-4 py-2.5 rounded-xl">
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <span className="text-xs text-muted-foreground">— {note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Quick facts ── */}
        <motion.section {...fade(0.2)}>
          <h2 className="text-xl font-bold mb-4">Quick facts</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: MapPin,        text: 'Hetauda, Bagmati Province, Nepal' },
              { icon: Code2,         text: 'Stack: React · Node.js · TypeScript' },
              { icon: Flame,         text: 'Obsessed with AI and what it will become' },
              { icon: Coffee,        text: 'Tea > Coffee (fight me)' },
              { icon: BookOpen,      text: 'Learning: ML math, system design, writing' },
              { icon: GraduationCap, text: 'Grade 11 · Science stream · HSM Hetauda' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-card border border-border px-4 py-3 rounded-xl text-sm text-foreground">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Why this site ── */}
        <motion.section {...fade(0.22)}>
          <h2 className="text-xl font-bold mb-4">Why this site exists</h2>
          <div className="bg-card border border-border rounded-2xl p-6 text-muted-foreground text-sm leading-relaxed space-y-3">
            <p>
              Social media wanted me to perform. This site lets me <em className="text-foreground font-medium">exist</em>.
              No algorithm decides what you see. No like count tells me if something was worth writing.
              Just me, documenting my life as it actually happens: the good builds, the failed experiments,
              the random 2am thoughts, the memories I don't want to forget.
            </p>
            <p>
              Think of it as stepping into my room. You're welcome to look around.
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <Link href="/blog" className="text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
              Read My Philosophy
            </Link>
            <Link href="/guestbook" className="text-sm font-medium bg-card border border-border text-foreground px-5 py-2.5 rounded-xl hover:bg-muted transition-colors">
              Leave a Note
            </Link>
          </div>
        </motion.section>

      </div>
    </PageWrapper>
  );
}
