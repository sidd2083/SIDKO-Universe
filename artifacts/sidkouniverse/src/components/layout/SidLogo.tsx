import React from 'react';

interface SidLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export function SidLogoIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
  const text = { sm: 'text-[11px]', md: 'text-sm', lg: 'text-base' };

  return (
    <div
      className={`${dims[size]} rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden`}
      style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
        boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
      }}
    >
      {/* subtle grid texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 4px)',
        }}
      />
      <span
        className={`relative text-white font-black ${text[size]} tracking-[-0.04em] italic select-none`}
        style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1 }}
      >
        sid
      </span>
    </div>
  );
}

export function SidWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-black tracking-tight leading-none select-none ${className}`} style={{ lineHeight: 1 }}>
      <span className="text-foreground">sid</span>
      <span
        className="text-transparent bg-clip-text"
        style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6, #60a5fa)' }}
      >
        ko
      </span>
      <span className="text-muted-foreground font-medium text-[0.7em]">universe</span>
    </span>
  );
}
