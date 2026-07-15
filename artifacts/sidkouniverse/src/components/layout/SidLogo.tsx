import React from 'react';

/**
 * The "S" mark — no box, just a clean bold italic letterform.
 * Used as the standalone icon in narrow spaces.
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
        background: 'linear-gradient(135deg, #3b82f6 0%, #818cf8 100%)',
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

/**
 * Full wordmark: "Siddhant" — used in sidebar and mobile header.
 */
export function SidWordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`leading-none select-none ${className}`}
      style={{
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
        fontWeight: 800,
        fontStyle: 'italic',
        letterSpacing: '-0.04em',
      }}
    >
      <span
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #818cf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        S
      </span>
      <span style={{ WebkitTextFillColor: 'initial', color: 'inherit', fontStyle: 'normal', fontWeight: 700 }}>
        iddhant
      </span>
    </span>
  );
}
