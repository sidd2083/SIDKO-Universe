import React from 'react';
import { motion } from 'framer-motion';

// ── Sidebar logo: floating avatar + shimmer wordmark ─────────────────────────

/**
 * Sidebar logo — a glowing floating "S" avatar beside an animated shimmer
 * "Siddhant" wordmark. Both animations run continuously so they're always visible.
 */
export function SidWordmarkAnimated({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`flex items-center gap-3 select-none ${className}`}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Floating avatar with rotating gradient ring */}
      <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
        {/* Outer ring — rotates continuously */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'conic-gradient(from 0deg, #3b82f6, #818cf8, #c084fc, #f472b6, #fb923c, #3b82f6)',
          }}
        />
        {/* Inner disc — counter-floats so the "S" stays upright */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          className="bg-sidebar"
          style={{
            position: 'absolute',
            inset: 2.5,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: '1.05rem',
              lineHeight: 1,
              background:
                'linear-gradient(135deg, #3b82f6 0%, #818cf8 60%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            S
          </span>
        </motion.div>
        {/* Glow under the avatar */}
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.15, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(129,140,248,0.35) 0%, transparent 70%)',
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Shimmer wordmark */}
      <motion.span
        animate={{ backgroundPosition: ['0% 50%', '200% 50%', '0% 50%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{
          fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: '1.25rem',
          letterSpacing: '-0.045em',
          lineHeight: 1,
          background:
            'linear-gradient(90deg, #3b82f6 0%, #818cf8 25%, #c084fc 50%, #818cf8 75%, #3b82f6 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'inline-block',
        }}
      >
        Siddhant
      </motion.span>
    </motion.div>
  );
}

// ── Static variants (mobile header, etc.) ────────────────────────────────────

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
