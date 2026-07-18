/**
 * Full-screen image lightbox with:
 * - Swipe left/right to navigate multiple images
 * - Double-tap / double-click to zoom 2x (tap again to reset)
 * - Pinch-to-zoom on mobile via CSS zoom (browser-native)
 * - Swipe down to close
 * - Keyboard: ArrowLeft, ArrowRight, Escape
 * - Smooth framer-motion animations
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface Props {
  images: string[];
  initialIndex?: number;
  alt?: string;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex = 0, alt = '', onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [direction, setDirection] = useState(0); // -1 prev, 1 next
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTap = useRef<number>(0);
  const imgRef = useRef<HTMLDivElement>(null);

  const go = useCallback((dir: number) => {
    if (images.length <= 1) return;
    setZoomed(false);
    setDirection(dir);
    setIndex(prev => (prev + dir + images.length) % images.length);
  }, [images.length]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.time;
    touchStart.current = null;

    // Double-tap to zoom
    if (Math.abs(dx) < 15 && Math.abs(dy) < 15 && dt < 250) {
      const now = Date.now();
      if (now - lastTap.current < 350) {
        setZoomed(z => !z);
      }
      lastTap.current = now;
      return;
    }

    // Swipe down to close
    if (dy > 80 && Math.abs(dx) < 60 && !zoomed) {
      onClose();
      return;
    }

    // Swipe left/right to navigate
    if (Math.abs(dx) > 50 && Math.abs(dy) < 60 && !zoomed) {
      go(dx < 0 ? 1 : -1);
    }
  };

  const handleDoubleClick = () => setZoomed(z => !z);

  const variants = {
    enter: (dir: number) => ({ x: dir * 80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -80, opacity: 0 }),
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <span className="text-white/50 text-sm select-none">
          {images.length > 1 ? `${index + 1} / ${images.length}` : alt}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomed(z => !z)}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            {zoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        ref={imgRef}
        className="flex-1 relative overflow-hidden flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex items-center justify-center p-2"
          >
            <img
              src={images[index]}
              alt={alt}
              draggable={false}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transition: 'transform 0.25s ease',
                transform: zoomed ? 'scale(2)' : 'scale(1)',
                transformOrigin: 'center center',
                cursor: zoomed ? 'zoom-out' : 'zoom-in',
                touchAction: zoomed ? 'pinch-zoom' : 'manipulation',
                userSelect: 'none',
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Prev/Next arrows — desktop */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors hidden sm:flex"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors hidden sm:flex"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip — only if multiple images */}
      {images.length > 1 && (
        <div className="flex-shrink-0 pb-4 pt-2 overflow-x-auto">
          <div className="flex gap-2 justify-center px-4 min-w-max mx-auto">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); setZoomed(false); }}
                className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  i === index ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile swipe hint */}
      {images.length > 1 && (
        <p className="text-center text-white/20 text-xs pb-3 sm:hidden select-none">
          Swipe to navigate · Double-tap to zoom · Swipe down to close
        </p>
      )}
    </motion.div>
  );
}
