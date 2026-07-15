import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { motion } from 'framer-motion';
import {
  Code2, Globe, Camera, BookOpen, Brain, Database,
  MapPin, Coffee, Music, Rocket, GraduationCap, Layers,
} from 'lucide-react';

const skills = [
  {
    icon: Code2,
    label: 'Full-Stack Web Dev',
    desc: 'React, Node.js, TypeScript, REST APIs, Express',
  },
  {
    icon: Brain,
    label: 'AI / Machine Learning',
    desc: 'Python, NumPy, Pandas — actively learning & building',
  },
  {
    icon: Layers,
    label: 'UI & Design Systems',
    desc: 'Tailwind CSS, Framer Motion, component architecture',
  },
  {
    icon: Database,
    label: 'Databases & APIs',
    desc: 'PostgreSQL, Drizzle ORM, REST API design',
  },
  {
    icon: Globe,
    label: 'WordPress',
    desc: 'Custom themes, plugins, site builds',
  },
  {
    icon: Camera,
    label: 'Photo Editing',
    desc: 'Lightroom, retouching, visual composition',
  },
];

const schedule = [
  { emoji: '🏋️‍♂️', label: 'Gym' },
  { emoji: '📚', label: 'College' },
  { emoji: '🧠', label: 'Research' },
  { emoji: '💻', label: 'Building' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '😴', label: 'Sleep' },
];

const facts = [
  { icon: MapPin, text: 'Based in Hetauda, Nepal' },
  { icon: Code2, text: 'Main stack: React, Node.js, TypeScript' },
  { icon: Music, text: 'Always listening to something' },
  { icon: Coffee, text: 'Fueled by tea & late nights' },
  { icon: Rocket, text: 'Building StudentHub Nepal' },
  { icon: GraduationCap, text: 'Grade 11 — HSM, Hetauda' },
];

export default function About() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Me</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            I'm Siddhant Lamichhane — a builder, a learner, and a Grade 11 student from Nepal trying
            to make something real out of this era of technology.
          </p>
        </motion.div>

        <div className="space-y-12">

          {/* Why this exists */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h2 className="text-2xl font-bold mb-4">Why this exists</h2>
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-muted-foreground leading-relaxed">
                I built this space because I wanted a digital home I completely own. Social media felt too
                noisy, too fast, and too driven by algorithms. I wanted a quiet place to document my life,
                my thoughts, and the things I build — a place that feels like stepping into my room. No
                likes, no followers count, just me writing for me (and whoever stumbles in).
              </p>
            </div>
          </motion.section>

          {/* Current Life */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-4">Current Life</h2>
            <p className="text-muted-foreground mb-5 leading-relaxed">
              Studying at Hetauda School of Management in Nepal. My days are structured around growth —
              most of it self-directed, some of it painful, all of it worthwhile.
            </p>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex flex-wrap gap-2.5">
                {schedule.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2 bg-background border border-border px-4 py-2.5 rounded-xl text-sm font-medium text-foreground"
                  >
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Skills */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-2xl font-bold mb-2">Skills</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Things I can actually build with — not just buzz words.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {skills.map((skill) => (
                <motion.div
                  key={skill.label}
                  whileHover={{ y: -2 }}
                  className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3 hover:shadow-sm transition-shadow"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
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

          {/* What I'm building */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-4">What I'm Building</h2>
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-xl shrink-0">
                  🎓
                </div>
                <div>
                  <p className="font-bold text-foreground mb-1">StudentHub Nepal</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    My biggest project yet — a platform connecting students across Nepal for resources,
                    notes, and collaboration. It's the tool I wished existed when I started my +2 journey.
                    Stack: React, Node.js, TypeScript, PostgreSQL.
                  </p>
                  <p className="text-xs text-primary font-medium mt-3">🚀 In active development</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed px-1">
              Outside of StudentHub, I spend a lot of time going deep on AI and machine learning — reading
              papers, running experiments, and trying to understand the field well enough to eventually
              build something meaningful with it.
            </p>
          </motion.section>

          {/* Quick Facts */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-2xl font-bold mb-4">Quick Facts</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {facts.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 bg-card border border-border px-4 py-3 rounded-xl text-sm text-foreground"
                >
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.section>

        </div>
      </div>
    </PageWrapper>
  );
}
