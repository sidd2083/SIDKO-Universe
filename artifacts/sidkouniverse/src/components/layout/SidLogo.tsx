import React from 'react';
import { motion } from 'framer-motion';

// ─── Animated full wordmark ────────────────────────────────────────────────────
const WORD = 'Siddhant'.split('');

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.05 },
  },
};

const letterVar = {
  hidden: { y: 14, opacity: 0, rotateX: 40 },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: { type: 'spring' as const, stiffness: 500, damping: 30 },
  },
};

/**
 * Animated "Siddhant" wordmark.
 * Letters spring up one by one; "S" carries the gradient accent.
 * Used in the sidebar header.
 */
export function SidWordmarkAnimated({ className = '' }: { className?: string }) {
  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      aria-label="Siddhant"
      className={`flex items-baseline select-none ${className}`}
      style={{
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
        fontWeight: 800,
        letterSpacing: '-0.045em',
        lineHeight: 1,
        perspective: 400,
      }}
    >
      {WORD.map((ch, i) => {
        const isFirst = i === 0;
        return (
          <motion.span
            key={i}
            variants={letterVar}
            style={{
              display: 'inline-block',
              fontStyle: isFirst ? 'italic' : 'normal',
              fontWeight: isFirst ? 900 : 700,
              ...(isFirst
                ? {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #818cf8 60%, #c084fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }
                : {}),
            }}
          >
            {ch}
          </motion.span>
        );
      })}
    </motion.span>
  );
}

/**
 * Static "Siddhant" wordmark (no animation) — used in mobile header inline text.
 */
export function SidWordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`leading-none select-none ${className}`}
      style={{
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
        fontWeight: 800,
        letterSpacing: '-0.04em',
      }}
    >
      <span
        style={{
          fontStyle: 'italic',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #3b82f6 0%, #818cf8 60%, #c084fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        S
      </span>
      <span style={{ fontStyle: 'normal', fontWeight: 700 }}>iddhant</span>
    </span>
  );
}

/**
 * The "S" mark — standalone icon for narrow spaces.
 */
export function SidLogoIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const fontSize = { sm: '1.45rem', md: '1.85rem', lg: '2.4rem' }[size];
  return (
    <span
      aria-label="Sid"
      style={{
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
        fontWeight: 900,
        fontStyle: 'italic',
        fontSize,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        background: 'linear-gradient(135deg, #3b82f6 0%, #818cf8 60%, #c084fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        userSelect: 'none',
        display: 'inline-block',
      }}
    >
      S
    </span>
  );
}
