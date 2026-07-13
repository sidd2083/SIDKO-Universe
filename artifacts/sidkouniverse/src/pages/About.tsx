import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">About Me</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
          <p className="text-xl text-foreground font-medium mb-10 leading-relaxed">
            Hey! I'm Siddhant Lamichhane. Welcome to my own little universe.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Why this exists</h2>
            <p>
              I built this space because I wanted a digital home that I completely control. Social media felt too noisy, too fast, and too driven by algorithms. I wanted a quiet place to document my life, my thoughts, and the things I build—a place that feels like stepping into my room.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Current Life</h2>
            <p>
              I'm a Grade 11 student studying at Hetauda School of Management in Nepal. 
              My days are pretty structured right now:
            </p>
            <div className="bg-card border border-border rounded-xl p-6 my-6 font-mono text-sm shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex gap-4"><span className="text-primary font-bold">05:00</span> <span>Wake up & Gym 🏋️‍♂️</span></div>
                <div className="flex gap-4"><span className="text-primary font-bold">08:00</span> <span>College 📚</span></div>
                <div className="flex gap-4"><span className="text-primary font-bold">14:00</span> <span>Learning & Research 🧠</span></div>
                <div className="flex gap-4"><span className="text-primary font-bold">18:00</span> <span>Building Projects 💻</span></div>
                <div className="flex gap-4"><span className="text-primary font-bold">22:30</span> <span>Sleep 😴</span></div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">What I'm Learning & Building</h2>
            <p>
              I spend most of my free time coding. Right now, I'm deep diving into AI and Machine Learning.
            </p>
            <p>
              My main focus is building <strong>StudentHub Nepal</strong> — a platform connecting students across the country for resources, notes, and collaboration. It's the tool I wished existed when I started my +2 journey.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Quick Facts</h2>
            <ul className="grid sm:grid-cols-2 gap-4 list-none pl-0">
              <li className="bg-card border border-border px-4 py-3 rounded-xl m-0">📍 Based in Hetauda, Nepal</li>
              <li className="bg-card border border-border px-4 py-3 rounded-xl m-0">💻 Main stack: React, Firebase</li>
              <li className="bg-card border border-border px-4 py-3 rounded-xl m-0">🎧 Always listening to music</li>
              <li className="bg-card border border-border px-4 py-3 rounded-xl m-0">☕ Fueled by coffee</li>
            </ul>
          </section>
          
          <section className="mb-12 border-t border-border pt-12">
            <h2 className="text-2xl font-bold text-foreground mb-8">Timeline</h2>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl bg-card border border-border shadow-sm">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-foreground">Started Grade 11</div>
                    <time className="text-xs font-medium text-primary">2023</time>
                  </div>
                  <div className="text-sm">Joined Hetauda School of Management. The beginning of the +2 journey.</div>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl bg-card border border-border shadow-sm">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-foreground">Began coding journey</div>
                    <time className="text-xs font-medium text-primary">2022</time>
                  </div>
                  <div className="text-sm">Wrote my first line of code. Everything changed.</div>
                </div>
              </div>
              
            </div>
          </section>

        </div>
      </div>
    </PageWrapper>
  );
}