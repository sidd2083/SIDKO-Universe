import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { motion } from 'framer-motion';
import { Code2, Globe, Camera, BookOpen, Brain, Database } from 'lucide-react';

const skills = [
  { icon: Code2,    label: 'Full-Stack Web Dev',   desc: 'React, Node.js, Firebase, REST APIs' },
  { icon: Brain,    label: 'Python',                desc: 'Scripting, automation, AI/ML workflows' },
  { icon: Globe,    label: 'WordPress',             desc: 'Themes, plugins, custom sites' },
  { icon: Camera,   label: 'Photo Editing',         desc: 'Basic retouching, composition, Lightroom' },
  { icon: Database, label: 'NumPy & Pandas',        desc: 'Data manipulation and analysis' },
  { icon: BookOpen, label: 'Learning: AI/ML',       desc: 'Currently deep-diving into AI & ML' },
];

const schedule = [
  { emoji: '🏋️‍♂️', label: 'Gym' },
  { emoji: '📚', label: 'College' },
  { emoji: '🧠', label: 'Learning & Research' },
  { emoji: '💻', label: 'Building Projects' },
  { emoji: '😴', label: 'Sleep' },
];

export default function About() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-8">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-8"
        >
          About Me
        </motion.h1>

        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground space-y-12">

          {/* Intro */}
          <p className="text-xl text-foreground font-medium leading-relaxed">
            Hey! I'm Siddhant Lamichhane. Welcome to my own little universe.
          </p>

          {/* Why this exists */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why this exists</h2>
            <p>
              I built this space because I wanted a digital home that I completely control. Social media felt too noisy, too fast, and too driven by algorithms. I wanted a quiet place to document my life, my thoughts, and the things I build — a place that feels like stepping into my room.
            </p>
          </section>

          {/* Current Life */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Current Life</h2>
            <p>
              I'm a Grade 11 student studying at Hetauda School of Management in Nepal. My days are structured around growth:
            </p>
            <div className="bg-card border border-border rounded-2xl p-5 mt-5 not-prose">
              <div className="flex flex-wrap gap-3">
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
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Skills</h2>
            <div className="not-prose grid sm:grid-cols-2 gap-3">
              {skills.map((skill) => (
                <motion.div
                  key={skill.label}
                  whileHover={{ y: -2 }}
                  className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <skill.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{skill.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{skill.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* What I'm building */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What I'm Building</h2>
            <p>
              I spend most of my free time coding. Right now, I'm deep diving into AI and Machine Learning.
            </p>
            <p>
              My main focus is <strong>StudentHub Nepal</strong> — a platform connecting students across Nepal for resources, notes, and collaboration. It's the tool I wished existed when I started my +2 journey.
            </p>
          </section>

          {/* Quick Facts */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Quick Facts</h2>
            <ul className="not-prose grid sm:grid-cols-2 gap-3 list-none pl-0">
              {[
                '📍 Based in Hetauda, Nepal',
                '💻 Main stack: React, Firebase',
                '🎧 Always listening to music',
                '☕ Fueled by coffee',
                '🚀 Building StudentHub Nepal',
                '📖 Grade 11 — HSM, Hetauda',
              ].map((fact) => (
                <li key={fact} className="bg-card border border-border px-4 py-3 rounded-xl text-sm text-foreground">
                  {fact}
                </li>
              ))}
            </ul>
          </section>

        </div>
      </div>
    </PageWrapper>
  );
}
