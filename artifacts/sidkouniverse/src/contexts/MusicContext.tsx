import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

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

  // Load tracks from the API server (where dashboard uploads go)
  useEffect(() => {
    fetch('/api/music')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTracks(data);
      })
      .catch(() => {});
  }, []);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const currentTrack = tracks[currentTrackIndex] ?? null;

  // When track changes, update audio src
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    const wasPlaying = isPlaying;
    audio.src = currentTrack.url;
    audio.load();
    if (wasPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex, currentTrack?.url]);

  // Sync volume + mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Sync play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex(prev => (prev + 1) % tracks.length);
    setIsPlaying(true);
  }, [tracks.length]);

  // Wire onended after nextTrack is stable
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.onended = nextTrack;
  }, [nextTrack]);

  const prevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex(prev => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  }, [tracks.length]);

  const togglePlay = useCallback(() => setIsPlaying(v => !v), []);
  const setVolume = useCallback((v: number) => setVolumeState(v), []);
  const toggleMute = useCallback(() => setIsMuted(v => !v), []);

  const playTrack = useCallback((track: Track) => {
    const idx = tracks.findIndex(t => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
      setIsPlaying(true);
    }
  }, [tracks]);

  return (
    <MusicContext.Provider value={{ currentTrack, isPlaying, volume, isMuted, togglePlay, setVolume, toggleMute, nextTrack, prevTrack, playTrack, tracks }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
