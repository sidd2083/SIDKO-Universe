import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { apiUrl } from '@/lib/apiBase';

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
  isMuted: boolean;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  playTrack: (track: Track) => void;
  tracks: Track[];
}

const MusicContext = createContext<MusicContextType>({
  currentTrack: null,
  isPlaying: false,
  volume: 0.5,
  isMuted: false,
  togglePlay: () => {},
  setVolume: () => {},
  toggleMute: () => {},
  nextTrack: () => {},
  prevTrack: () => {},
  playTrack: () => {},
  tracks: [],
});

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Keep a ref in sync with isPlaying so effects always see the latest value
  const isPlayingRef = useRef(false);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // Fetch tracks
  useEffect(() => {
    fetch(apiUrl('/api/music'))
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTracks(data.filter(t => t.url)); })
      .catch(() => {});
  }, []);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.5;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const currentTrack = tracks[currentTrackIndex] ?? null;

  // When track index changes, swap the src and play if we were playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.url) return;
    const nextUrl = new URL(currentTrack.url, window.location.href).href;
    const prevUrl = audio.src ? new URL(audio.src, window.location.href).href : '';
    if (prevUrl === nextUrl) return;
    audio.src = currentTrack.url;
    audio.load();
    // Use the ref so we always see the LATEST isPlaying value, not a stale closure
    if (isPlayingRef.current) {
      audio.play().catch(() => setIsPlaying(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex, currentTrack?.url]);

  // Sync volume + mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex(prev => (prev + 1) % tracks.length);
    setIsPlaying(true);
  }, [tracks.length]);

  const prevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex(prev => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  }, [tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.onended = nextTrack;
  }, [nextTrack]);

  /**
   * togglePlay — must call audio.play()/pause() directly here, inside the
   * user-gesture call stack, so browsers allow the autoplay.
   */
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (!audio.src && currentTrack?.url) {
        audio.src = currentTrack.url;
        audio.load();
      }
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentTrack]);

  /**
   * playTrack — also directly calls audio.play() for the NEW track while
   * we're still inside the user-gesture call stack.
   */
  const playTrack = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    const idx = tracks.findIndex(t => t.id === track.id);
    if (idx === -1) return;

    if (idx === currentTrackIndex) {
      togglePlay();
    } else {
      // Directly set src & play within the gesture — don't defer to useEffect
      audio.src = track.url;
      audio.load();
      audio.play()
        .then(() => {
          setCurrentTrackIndex(idx);
          setIsPlaying(true);
        })
        .catch(() => {
          setCurrentTrackIndex(idx);
          setIsPlaying(false);
        });
    }
  }, [tracks, currentTrackIndex, togglePlay]);

  const setVolume = useCallback((v: number) => setVolumeState(v), []);
  const toggleMute = useCallback(() => setIsMuted(v => !v), []);

  return (
    <MusicContext.Provider value={{
      currentTrack, isPlaying, volume, isMuted,
      togglePlay, setVolume, toggleMute, nextTrack, prevTrack, playTrack, tracks,
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
