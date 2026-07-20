import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Brain, Code2, ChevronRight, BookMarked, Scroll, CheckCircle2, Circle } from 'lucide-react';

interface Topic {
  name: string;
  status: 'done' | 'learning' | 'next';
  desc: string;
  why: string;
  resources?: string[];
}

interface Section {
  id: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
  title: string;
  subtitle: string;
  topics: Topic[];
}

const sections: Section[] = [
  {
    id: 'math',
    icon: Brain,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    label: 'Math',
    title: 'Math for AI/ML',
    subtitle: 'The part that actually makes you dangerous',
    topics: [
      {
        name: 'Linear Algebra',
        status: 'learning',
        desc: 'Vectors, matrices, matrix multiplication, eigenvalues, dot products.',
        why: 'Neural networks are giant matrix operations. Every layer is a matrix multiply. You can\'t understand what\'s happening under the hood without this.',
        resources: ['3Blue1Brown — Essence of Linear Algebra (YouTube)', 'MIT 18.06 with Gilbert Strang'],
      },
      {
        name: 'Calculus & Derivatives',
        status: 'learning',
        desc: 'Derivatives, partial derivatives, chain rule, gradients.',
        why: 'Backpropagation is literally just the chain rule applied recursively. Every time a model "learns" something, calculus is happening.',
        resources: ['3Blue1Brown — Essence of Calculus', 'Khan Academy (free, genuinely good)'],
      },
      {
        name: 'Probability & Statistics',
        status: 'next',
        desc: 'Distributions, Bayes theorem, expectation, variance, normal distribution.',
        why: 'Every ML output is a probability. If you don\'t understand uncertainty, you don\'t understand the model.',
        resources: ['StatQuest with Josh Starmer (YouTube)', 'Think Stats — free online book'],
      },
      {
        name: 'Multivariable Calculus',
        status: 'next',
        desc: 'Gradient descent, Jacobians, optimization in high-dimensional spaces.',
        why: 'Training a neural net = optimizing a function with millions of variables. This is how.',
        resources: ['MIT 18.02', '3Blue1Brown Neural Networks series'],
      },
      {
        name: 'Information Theory',
        status: 'next',
        desc: 'Entropy, cross-entropy, KL divergence, mutual information.',
        why: 'Loss functions like cross-entropy come directly from information theory. Makes way more sense once you know the origin.',
        resources: ['Towards Data Science (articles)', 'Elements of Information Theory'],
      },
    ],
  },
  {
    id: 'python',
    icon: Code2,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    label: 'Python',
    title: 'Python & ML Libraries',
    subtitle: 'The actual toolkit',
    topics: [
      {
        name: 'NumPy',
        status: 'done',
        desc: 'N-dimensional arrays, vectorized ops, broadcasting, slicing.',
        why: 'Foundation of all numerical computing in Python. Everything else builds on this.',
        resources: ['NumPy official docs', 'NumPy 100 exercises (GitHub)'],
      },
      {
        name: 'Pandas',
        status: 'done',
        desc: 'DataFrames, data cleaning, groupby, merging, handling messy data.',
        why: 'Real data is disgusting. Pandas is how you make it usable.',
        resources: ['Pandas documentation', 'Kaggle Pandas course (free)'],
      },
      {
        name: 'Matplotlib & Seaborn',
        status: 'learning',
        desc: 'Line plots, scatter plots, histograms, heatmaps.',
        why: 'You can\'t improve what you can\'t see. Plotting reveals patterns in 5 seconds that tables take 20 minutes to find.',
        resources: ['Matplotlib gallery', 'Seaborn tutorial'],
      },
      {
        name: 'Scikit-learn',
        status: 'learning',
        desc: 'Linear regression, decision trees, SVM, k-means, metrics.',
        why: 'Best library for classical ML. Consistent API — learn it once, it works everywhere.',
        resources: ['Scikit-learn user guide', 'Hands-On Machine Learning (book)'],
      },
      {
        name: 'PyTorch',
        status: 'next',
        desc: 'Tensors, autograd, custom layers, training loops, GPU.',
        why: 'Preferred in research. More flexible than Keras. Great for actually understanding what\'s happening.',
        resources: ['PyTorch 60-minute blitz', 'fast.ai (uses PyTorch throughout)'],
      },
      {
        name: 'Hugging Face',
        status: 'next',
        desc: 'Pre-trained LLMs, BERT, GPT, fine-tuning, pipelines.',
        why: 'The go-to for NLP. Thousands of pre-trained models. Honestly wild how easy it is now.',
        resources: ['HuggingFace course (free)', 'HuggingFace docs'],
      },
    ],
  },
];

const statusConfig = {
  done:     { icon: CheckCircle2, label: 'Done',     color: 'text-green-500', bg: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  learning: { icon: Circle,       label: 'In progress', color: 'text-blue-400', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  next:     { icon: Circle,       label: 'Up next',  color: 'text-muted-foreground', bg: 'bg-muted text-muted-foreground' },
};

const philosophers = [
  {
    name: 'Socrates',
    years: '470–399 BC',
    emoji: '🏛️',
    tag: 'Know nothing, question everything',
    take: 'I catch myself pretending to understand things I don\'t. Socrates would have destroyed me in a conversation — and that\'s exactly why I respect him. His whole method was just: ask "why?" until the person realizes they were repeating what they heard, not what they actually know. The most dangerous thing you can do intellectually is to stop questioning.',
    quote: 'The only true wisdom is in knowing you know nothing.',
  },
  {
    name: 'Plato',
    years: '428–348 BC',
    emoji: '💡',
    tag: 'The shadows on the wall aren\'t real',
    take: 'The Allegory of the Cave hit me differently. Prisoners chained in a cave, thinking shadows are reality — and when one escapes into sunlight, he can\'t convince the others. That\'s social media. That\'s echo chambers. That\'s anyone who\'s already decided what they believe and filters everything else out. Plato wrote this in 380 BC.',
    quote: 'The real tragedy is when men are afraid of the light.',
  },
  {
    name: 'Aristotle',
    years: '384–322 BC',
    emoji: '⚖️',
    tag: 'You are what you repeatedly do',
    take: 'This is the one I come back to most. Not "think good thoughts" — actually do the thing, every day, until it\'s who you are. Every time I skip a habit I said I\'d build, Aristotle is somewhere disappointed. Identity is downstream of behavior. You don\'t decide to be disciplined. You just keep showing up until discipline is what you are.',
    quote: 'Excellence is not an act, but a habit.',
  },
  {
    name: 'Nietzsche',
    years: '1844–1900',
    emoji: '⚡',
    tag: 'Stop outsourcing your values',
    take: 'The most misunderstood philosopher alive. He wasn\'t nihilistic — he was saying the old maps are gone, so stop waiting for someone to hand you a purpose and build your own. What I take from him: figure out what actually matters to you and commit completely. Don\'t live by rules you inherited from people who weren\'t thinking about your life.',
    quote: 'That which does not kill us makes us stronger.',
  },
  {
    name: 'Camus',
    years: '1913–1960',
    emoji: '🌊',
    tag: 'Life is absurd. Do it anyway.',
    take: 'Sisyphus pushes a rock up a hill forever. It rolls back every time. Camus says we must imagine Sisyphus happy. I used to think that was bleak. Now I think it\'s the most honest thing anyone\'s ever said about motivation. The point isn\'t the destination. The doing is the point. There\'s something freeing in that once you actually accept it.',
    quote: 'One must imagine Sisyphus happy.',
  },
];

function TopicRow({ topic }: { topic: Topic }) {
  const [open, setOpen] = useState(false);
  const st = statusConfig[topic.status];

  return (
    <div className={cn('border-b border-border/40 last:border-0 transition-colors', open && 'bg-card/40')}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-4 py-4 text-left"
      >
        <st.icon className={cn('w-4 h-4 shrink-0', st.color, topic.status === 'done' && 'fill-green-500/20')} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-foreground">{topic.name}</span>
        </div>
        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0', st.bg)}>
          {st.label}
        </span>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-12 pb-5 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">{topic.desc}</p>
              <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
                <p className="text-xs font-semibold text-primary mb-1">Why it matters to me</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{topic.why}</p>
              </div>
              {topic.resources && (
                <div className="flex flex-wrap gap-2">
                  {topic.resources.map(r => (
                    <span key={r} className="text-[11px] bg-muted border border-border text-muted-foreground px-2.5 py-1 rounded-lg">
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhilosopherEntry({ p, index }: { p: typeof philosophers[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="border-b border-border/40 last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 py-5 text-left"
      >
        <span className="text-2xl shrink-0">{p.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-bold text-foreground">{p.name}</span>
            <span className="text-xs text-muted-foreground/60 font-mono">{p.years}</span>
          </div>
          <p className="text-xs text-muted-foreground italic">{p.tag}</p>
        </div>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-6 pl-10 space-y-4">
              <blockquote className="border-l-2 border-amber-500/50 pl-4">
                <p className="text-sm text-foreground italic leading-relaxed">"{p.quote}"</p>
              </blockquote>
              <div className="rounded-xl bg-card border border-border px-4 py-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">My take</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.take}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

type Tab = 'math' | 'python' | 'philosophy';

export default function Learning() {
  const [activeTab, setActiveTab] = useState<Tab>('math');
  const activeSection = sections.find(s => s.id === activeTab);

  const doneCount = activeSection ? activeSection.topics.filter(t => t.status === 'done').length : 0;
  const total = activeSection ? activeSection.topics.length : 0;

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Learning</p>
          <h1 className="text-[2.6rem] font-black tracking-tight leading-tight mb-4">
            My study map.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
            AI/ML foundations I'm working through, tools I'm picking up,
            and philosophers who've actually changed how I think.
            Honest about what's done and what I'm still avoiding.
          </p>
        </motion.div>

        {/* Tab strip */}
        <div className="flex items-center gap-1 mb-8 p-1 bg-card border border-border rounded-2xl w-fit">
          {[
            { id: 'math' as Tab,       icon: Brain,        label: 'Math' },
            { id: 'python' as Tab,     icon: Code2,        label: 'Python' },
            { id: 'philosophy' as Tab, icon: BookMarked,   label: 'Philosophy' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all',
                activeTab === t.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* AI/ML sections */}
            {activeSection && (
              <>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h2 className={cn('text-xl font-bold', activeSection.color)}>{activeSection.title}</h2>
                    <p className="text-sm text-muted-foreground">{activeSection.subtitle}</p>
                  </div>
                  {doneCount > 0 && (
                    <span className="text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-xl">
                      {doneCount}/{total} done
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {total > 0 && (
                  <div className="mt-3 mb-6 h-1 rounded-full bg-border overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(doneCount / total) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                )}

                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  {activeSection.topics.map(topic => (
                    <TopicRow key={topic.name} topic={topic} />
                  ))}
                </div>
              </>
            )}

            {/* Philosophy */}
            {activeTab === 'philosophy' && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-amber-400">Philosophy</h2>
                  <p className="text-sm text-muted-foreground">
                    Thinkers who've actually changed how I see things — with my honest take, not a Wikipedia summary.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-2xl px-4">
                  {philosophers.map((p, i) => (
                    <PhilosopherEntry key={p.name} p={p} index={i} />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
