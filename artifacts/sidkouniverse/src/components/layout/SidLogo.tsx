import React from 'react';

/** Just the "sid" wordmark — no box, no background. */
export function SidLogoIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl' }[size];
  return (
    <span
      className={`font-black tracking-tighter leading-none select-none ${sizeClass}`}
      style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.05em' }}
    >
      <span className="text-foreground">s</span>
      <span
        className="text-transparent bg-clip-text"
        style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #818cf8 100%)' }}
      >
        id
      </span>
    </span>
  );
}

export function SidWordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-black tracking-tighter leading-none select-none ${className}`}
      style={{ letterSpacing: '-0.05em' }}
    >
      <span className="text-foreground">s</span>
      <span
        className="text-transparent bg-clip-text"
        style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #818cf8 100%)' }}
      >
        id
      </span>
      <span className="text-muted-foreground font-semibold" style={{ fontSize: '0.72em', letterSpacing: '-0.02em' }}>ko</span>
    </span>
  );
}
