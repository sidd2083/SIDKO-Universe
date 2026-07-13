import React, { useState } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX, Music } from 'lucide-react';
import { useMusic } from '@/contexts/MusicContext';
import { motion, AnimatePresence } from 'framer-motion';

export function MusicPlayer() {
  const { currentTrack, isPlaying, volume, togglePlay, setVolume, nextTrack } = useMusic();
  const [expanded, setExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.5);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (v === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  if (!currentTrack) {
    return null; // Return null until a track is available
  }

  return (
    <motion.div 
      className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 flex items-end justify-end"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div 
        className="bg-card/90 backdrop-blur-xl border border-border shadow-xl rounded-2xl overflow-hidden cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center p-2 gap-3 min-w-[180px]">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted">
            {currentTrack.coverImage ? (
              <img src={currentTrack.coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-[2px]">
                <motion.div className="w-1 h-3 bg-white rounded-full" animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} />
                <motion.div className="w-1 h-4 bg-white rounded-full" animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} />
                <motion.div className="w-1 h-3 bg-white rounded-full" animate={{ height: [6, 14, 6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-xs font-semibold truncate text-foreground leading-tight">
              {currentTrack.title || "Unknown Track"}
            </p>
            <p className="text-[10px] text-muted-foreground">Playing now</p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="p-1.5 rounded-full hover:bg-muted text-foreground transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-[1px]" />}
            </button>
            {expanded && (
              <button 
                onClick={(e) => { e.stopPropagation(); nextTrack(); }}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-3 pb-3 pt-1 border-t border-border/50"
            >
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground">
                  {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
                <input 
                  type="range" 
                  min="0" max="1" step="0.01" 
                  value={isMuted ? 0 : volume} 
                  onChange={handleVolumeChange}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-1 bg-muted rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}