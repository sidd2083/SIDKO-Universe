import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Track {
  id: string;
  title: string;
  url: string;
  coverImage?: string;
}

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  nextTrack: () => void;
  playTrack: (track: Track) => void;
}

const MusicContext = createContext<MusicContextType>({
  currentTrack: null,
  isPlaying: false,
  volume: 0.5,
  togglePlay: () => {},
  setVolume: () => {},
  nextTrack: () => {},
  playTrack: () => {},
});

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'music'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedTracks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Track));
      setTracks(loadedTracks);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = nextTrack;
    }
  }, []);

  const currentTrack = tracks[currentTrackIndex] || null;

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      if (audioRef.current.src !== currentTrack.url) {
        const wasPlaying = !audioRef.current.paused;
        audioRef.current.src = currentTrack.url;
        audioRef.current.load();
        if (wasPlaying || isPlaying) {
          audioRef.current.play().catch(() => setIsPlaying(false));
        }
      }
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const setVolume = (v: number) => setVolumeState(v);
  
  const nextTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };
  
  const playTrack = (track: Track) => {
    const idx = tracks.findIndex(t => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
      setIsPlaying(true);
    }
  };

  return (
    <MusicContext.Provider value={{ currentTrack, isPlaying, volume, togglePlay, setVolume, nextTrack, playTrack }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);