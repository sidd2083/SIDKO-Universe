import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Brain, Code2, ChevronDown, AlertTriangle } from 'lucide-react';

interface Topic {
  name: string;
  desc: string;
  why: string;
  resources?: string[];
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

export default function Learning() {
  const [activeTab, setActiveTab] = useState<'math' | 'python'>('math');
  const active = sections.find((s) => s.id === activeTab)!;

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Learning</h1>
          <p className="text-muted-foreground">
            My study map for AI & ML — what I want to learn and why each piece matters.
          </p>
        </motion.div>

        {/* ── Honest confession ── */}
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
        <div className="flex gap-2 mb-8 p-1 bg-card border border-border rounded-2xl w-fit">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id as 'math' | 'python')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                activeTab === s.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <s.icon className="w-4 h-4" />
              {s.title}
            </button>
          ))}
        </div>

        {/* Section header */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className={cn('text-2xl font-bold mb-1', active.color)}>{active.title}</h2>
          <p className="text-muted-foreground text-sm">{active.subtitle}</p>
        </motion.div>

        {/* Topic cards */}
        <motion.div
          key={activeTab + '-list'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {active.topics.map((topic, i) => (
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
      </div>
    </PageWrapper>
  );
}
