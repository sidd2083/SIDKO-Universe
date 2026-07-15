import React, { useState } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX, Music2 } from 'lucide-react';
import { useMusic } from '@/contexts/MusicContext';
import { motion, AnimatePresence } from 'framer-motion';

export function MusicPlayer() {
  const { currentTrack, isPlaying, volume, isMuted, togglePlay, setVolume, toggleMute, nextTrack } = useMusic();
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.6 }}
    >
      <AnimatePresence mode="wait">
        {!currentTrack ? (
          /* ── Minimal icon: no track loaded yet ── */
          <motion.div
            key="no-track"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-12 h-12 rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-lg flex items-center justify-center text-muted-foreground"
          >
            <Music2 className="w-5 h-5" />
          </motion.div>
        ) : (
          /* ── Full player ── */
          <motion.div
            key="player"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-card/90 backdrop-blur-xl border border-border shadow-xl rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => setExpanded(e => !e)}
          >
            {/* ── Collapsed row ── */}
            <div className="flex items-center p-2 gap-2 min-w-[200px]">
              {/* Album art / equalizer */}
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-muted">
                {currentTrack.coverImage ? (
                  <img src={currentTrack.coverImage} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-[2px]">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <motion.div
                        key={i}
                        className="w-[3px] bg-white rounded-full"
                        animate={{ height: ['4px', '12px', '4px'] }}
                        transition={{ repeat: Infinity, duration: 0.7, delay, ease: 'easeInOut' }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-foreground leading-tight">
                  {currentTrack.title}
                </p>
                <p className="text-[10px] text-muted-foreground">{isPlaying ? 'Playing' : 'Paused'}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-full hover:bg-muted text-foreground transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying
                    ? <Pause className="w-4 h-4" />
                    : <Play className="w-4 h-4 ml-[1px]" />}
                </button>
              </div>
            </div>

            {/* ── Expanded: volume + skip ── */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="px-3 pb-3 pt-1 border-t border-border/50"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3 h-3 text-muted-foreground shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={e => setVolume(parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-muted rounded-full appearance-none
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-3
                        [&::-webkit-slider-thumb]:h-3
                        [&::-webkit-slider-thumb]:bg-primary
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <button
                      onClick={nextTrack}
                      className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Next track"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
