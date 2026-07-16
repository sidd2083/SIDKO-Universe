import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Brain, Code2, ChevronDown, AlertTriangle, Scroll } from 'lucide-react';

interface Topic {
  name: string;
  desc: string;
  why: string;
  resources?: string[];
}

interface Philosopher {
  name: string;
  years: string;
  emoji: string;
  school: string;
  coreIdea: string;
  quote: string;
  quoteContext: string;
  howIThinkAboutIt: string;
}

interface Section {
  id: string;
  icon: React.ElementType;
  color: string;
  title: string;
  subtitle: string;
  topics: Topic[];
}

const sections: Section[] = [
  {
    id: 'math',
    icon: Brain,
    color: 'text-violet-400',
    title: 'Math for AI/ML',
    subtitle: 'The foundation every AI engineer needs',
    topics: [
      {
        name: 'Linear Algebra',
        desc: 'Vectors, matrices, matrix multiplication, eigenvalues, eigenvectors, dot products.',
        why: 'Neural networks are just giant matrix operations. Every layer = a matrix multiply.',
        resources: ['3Blue1Brown — Essence of Linear Algebra', 'MIT 18.06 (Gilbert Strang)'],
      },
      {
        name: 'Calculus & Derivatives',
        desc: 'Derivatives, partial derivatives, chain rule, gradients, integrals.',
        why: 'Backpropagation is just chain rule applied recursively. Gradients tell the model how to improve.',
        resources: ['3Blue1Brown — Essence of Calculus', 'Khan Academy Calculus'],
      },
      {
        name: 'Probability & Statistics',
        desc: 'Probability distributions, Bayes theorem, expectation, variance, normal distribution.',
        why: 'Every ML model is making probabilistic predictions. Understanding uncertainty is key.',
        resources: ['StatQuest with Josh Starmer', 'Think Stats (free book)'],
      },
      {
        name: 'Multivariable Calculus',
        desc: 'Gradient descent, Jacobians, Hessians, optimization in high-dimensional spaces.',
        why: 'Training a neural network = optimizing a function with millions of variables.',
        resources: ['MIT 18.02', '3Blue1Brown Neural Networks series'],
      },
      {
        name: 'Information Theory',
        desc: 'Entropy, cross-entropy, KL divergence, mutual information.',
        why: 'Loss functions like cross-entropy come directly from information theory.',
        resources: ['Towards Data Science articles', 'Elements of Information Theory'],
      },
      {
        name: 'Optimization',
        desc: 'Gradient descent, SGD, Adam, momentum, learning rate schedules.',
        why: 'This is literally how models learn. Understanding optimizers helps you train faster.',
        resources: ['fast.ai — Practical Deep Learning', 'CS231n Stanford'],
      },
    ],
  },
  {
    id: 'python',
    icon: Code2,
    color: 'text-blue-400',
    title: 'Python & AI Libraries',
    subtitle: 'The toolkit every ML engineer uses daily',
    topics: [
      {
        name: 'NumPy',
        desc: 'N-dimensional arrays, vectorized math operations, broadcasting, slicing.',
        why: 'The foundation of all numerical computing in Python. Everything else builds on NumPy arrays.',
        resources: ['NumPy official docs', 'NumPy 100 exercises (GitHub)'],
      },
      {
        name: 'Pandas',
        desc: 'DataFrames, data cleaning, groupby, merging, handling missing values.',
        why: 'Real-world data is messy. Pandas is how you clean, explore, and prepare it.',
        resources: ['Pandas documentation', 'Kaggle Pandas course (free)'],
      },
      {
        name: 'Matplotlib & Seaborn',
        desc: 'Line plots, scatter plots, histograms, heatmaps, subplots.',
        why: "You can't improve what you can't see. Visualizing data reveals patterns instantly.",
        resources: ['Matplotlib gallery', 'Seaborn tutorial'],
      },
      {
        name: 'Scikit-learn',
        desc: 'Linear regression, decision trees, SVM, k-means, train/test split, metrics.',
        why: 'Best library for classical ML. Consistent API — learn once, apply everywhere.',
        resources: ['Scikit-learn user guide', 'Hands-On Machine Learning (book)'],
      },
      {
        name: 'TensorFlow / Keras',
        desc: 'Building neural networks, layers, activation functions, model training.',
        why: "Google's deep learning framework. Keras makes building NNs feel like Lego blocks.",
        resources: ['TensorFlow tutorials', 'Deep Learning with Python (Chollet)'],
      },
      {
        name: 'PyTorch',
        desc: 'Tensors, autograd, custom layers, training loops, GPU acceleration.',
        why: 'Preferred in research. More flexible than Keras — great for understanding internals.',
        resources: ['PyTorch 60-minute blitz', 'fast.ai course (uses PyTorch)'],
      },
      {
        name: 'Hugging Face Transformers',
        desc: 'Pre-trained LLMs, BERT, GPT, fine-tuning, tokenizers, pipelines.',
        why: 'The go-to library for NLP. Access to thousands of pre-trained models in 3 lines.',
        resources: ['HuggingFace course (free)', 'HuggingFace docs'],
      },
    ],
  },
];

const philosophers: Philosopher[] = [
  {
    name: 'Socrates',
    years: '470–399 BC',
    emoji: '🏛️',
    school: 'Classical Greek · Socratic Method',
    coreIdea:
      'True wisdom begins with knowing you know nothing. Question everything — especially your own beliefs. The unexamined life is not worth living.',
    quote: 'The only true wisdom is in knowing you know nothing.',
    quoteContext:
      'From Plato\'s Apology — Socrates explaining why he is considered wise despite claiming ignorance.',
    howIThinkAboutIt:
      'This hits me. I catch myself pretending to understand things I don\'t. Socrates would have destroyed me in a conversation — and that\'s exactly why I respect him. His method was simple: ask "why?" until the person realizes they were just repeating what they heard, not what they actually know.',
  },
  {
    name: 'Plato',
    years: '428–348 BC',
    emoji: '💡',
    school: 'Classical Greek · Idealism',
    coreIdea:
      'The world we see is just a shadow of a higher reality made of perfect, eternal "Forms." What we call a chair is just an imperfect copy of the ideal Form of Chair. Knowledge is remembering truths the soul already knows.',
    quote:
      'We can easily forgive a child who is afraid of the dark; the real tragedy of life is when men are afraid of the light.',
    quoteContext:
      'On the courage it takes to seek truth and leave comfortable ignorance behind.',
    howIThinkAboutIt:
      'The Allegory of the Cave is one of the most powerful things I\'ve ever read. Prisoners chained in a cave, mistaking shadows for reality — and when one escapes into the sunlight, he can\'t convince the others that what they see is fake. That\'s literally social media. That\'s echo chambers. That\'s people refusing to update their beliefs. Plato wrote this in 380 BC.',
  },
  {
    name: 'Aristotle',
    years: '384–322 BC',
    emoji: '⚖️',
    school: 'Classical Greek · Virtue Ethics',
    coreIdea:
      'Happiness (eudaimonia) is not a feeling — it\'s an activity. You become good by doing good, repeatedly, until it becomes habit. Virtue is the mean between two extremes: courage sits between cowardice and recklessness.',
    quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    quoteContext:
      'From Nicomachean Ethics — on how character is built through consistent action, not intention.',
    howIThinkAboutIt:
      'This is the one I come back to most. Not "think good thoughts" — actually do the thing, consistently, until it\'s who you are. Every time I skip a habit I told myself I\'d build, Aristotle is somewhere disappointed. His point is that identity is downstream of behavior. You don\'t decide to be disciplined — you just keep showing up until discipline is what you are.',
  },
  {
    name: 'Friedrich Nietzsche',
    years: '1844–1900',
    emoji: '⚡',
    school: 'Existentialism · Will to Power',
    coreIdea:
      'God is dead — meaning the old moral systems that gave life structure are collapsing. Now each person must create their own values. The Übermensch (Overman) doesn\'t follow inherited rules; he creates meaning from within. Embrace suffering — it\'s what makes you stronger.',
    quote: 'That which does not kill us makes us stronger.',
    quoteContext:
      'From Twilight of the Idols — on using hardship as fuel rather than an excuse.',
    howIThinkAboutIt:
      'Nietzsche is the philosopher people misunderstand the most. He wasn\'t nihilistic — he was the opposite. He was saying: the old maps are gone, so stop waiting for someone to hand you a purpose. Build one. What I take from him: stop outsourcing your values to what\'s "normal" or "expected." Figure out what actually matters to you and commit to it completely. Also, his writing style hits differently — aggressive, poetic, personal.',
  },
];

function TopicCard({ topic }: { topic: Topic }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div layout className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left gap-3"
      >
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">{topic.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{topic.desc}</p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border/50">
          <p className="text-sm text-muted-foreground leading-relaxed pt-3">{topic.desc}</p>
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-primary mb-1">Why it matters</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{topic.why}</p>
          </div>
          {topic.resources && topic.resources.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">📚 Learn from</p>
              <ul className="space-y-1">
                {topic.resources.map((r) => (
                  <li key={r} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function PhilosopherCard({ p, index }: { p: Philosopher; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 p-5 text-left"
      >
        <span className="text-3xl leading-none mt-0.5">{p.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="font-bold text-foreground">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.years}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{p.school}</p>
          <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2 italic">"{p.quote}"</p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="shrink-0 mt-1"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5 border-t border-border/50 space-y-4 pt-4">
          {/* Core Idea */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Core Idea</p>
            <p className="text-sm text-foreground leading-relaxed">{p.coreIdea}</p>
          </div>

          {/* Quote */}
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3">
            <p className="text-sm font-medium text-foreground italic leading-relaxed">"{p.quote}"</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{p.quoteContext}</p>
          </div>

          {/* How I think about it */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs font-semibold text-primary mb-1.5">How I think about it</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.howIThinkAboutIt}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

type Tab = 'math' | 'python' | 'philosophy';

export default function Learning() {
  const [activeTab, setActiveTab] = useState<Tab>('math');

  const tabs = [
    ...sections.map(s => ({ id: s.id as Tab, icon: s.icon, label: s.title })),
    { id: 'philosophy' as Tab, icon: Scroll, label: 'Philosophy' },
  ];

  const activeSection = sections.find(s => s.id === activeTab);

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Learning</h1>
          <p className="text-muted-foreground">
            My study map — AI/ML foundations, tools, and the thinkers who shaped how I see the world.
          </p>
        </motion.div>

        {/* Honest confession */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5"
        >
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground text-sm mb-1.5">My honest problem with learning</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I want to learn <em>everything</em>. Seriously — AI, ML, systems, math, design, business,
                philosophy, physics. I get excited, I open 12 tabs, I bookmark 40 resources… and then I
                don't execute. The list below isn't what I've mastered. It's what I <em>think</em> I
                should learn, which is a very different thing. I'm working on the gap between planning
                to learn and actually sitting down and doing it. If you struggle with the same thing,
                you're not alone.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 p-1 bg-card border border-border rounded-2xl w-fit flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                activeTab === t.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* AI/ML sections */}
        {activeSection && (
          <>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className={cn('text-2xl font-bold mb-1', activeSection.color)}>{activeSection.title}</h2>
              <p className="text-muted-foreground text-sm">{activeSection.subtitle}</p>
            </motion.div>

            <motion.div
              key={activeTab + '-list'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {activeSection.topics.map((topic, i) => (
                <motion.div
                  key={topic.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <TopicCard topic={topic} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        {/* Philosophy section */}
        {activeTab === 'philosophy' && (
          <motion.div key="philosophy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1 text-amber-400">Philosophy</h2>
              <p className="text-muted-foreground text-sm">
                Thinkers who changed how I see the world — their ideas, quotes, and what I actually take from them.
              </p>
            </div>

            <div className="space-y-3">
              {philosophers.map((p, i) => (
                <PhilosopherCard key={p.name} p={p} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}
