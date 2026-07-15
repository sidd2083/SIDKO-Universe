import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { isValidSessionToken, ADMIN_COOKIE_NAME } from '../lib/adminSession.js';

const MUSIC_FILE =
  process.env.VERCEL === '1'
    ? '/tmp/sidko-music.json'
    : path.resolve(process.cwd(), 'music.json');

export interface Track {
  id: string;
  title: string;
  url: string;
  coverImage?: string;
  order: number;
}

function readTracks(): Track[] {
  try {
    if (fs.existsSync(MUSIC_FILE)) {
      return JSON.parse(fs.readFileSync(MUSIC_FILE, 'utf-8')) as Track[];
    }
  } catch {
    // fall through to empty
  }
  return [];
}

function writeTracks(tracks: Track[]): void {
  fs.writeFileSync(MUSIC_FILE, JSON.stringify(tracks, null, 2), 'utf-8');
}

const router = Router();

router.get('/music', (_req, res): void => {
  const tracks = readTracks().sort((a, b) => a.order - b.order);
  res.json(tracks);
});

router.post('/music', (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) {
    res.status(401).json({ error: 'Admin session required' });
    return;
  }

  const { title, url, coverImage } = req.body as Partial<Track>;
  if (!title || !url) {
    res.status(400).json({ error: 'title and url are required' });
    return;
  }

  const tracks = readTracks();
  const newTrack: Track = {
    id: `track_${Date.now()}`,
    title: title.trim(),
    url,
    coverImage: coverImage ?? '',
    order: tracks.length,
  };
  tracks.push(newTrack);
  writeTracks(tracks);
  res.status(201).json(newTrack);
});

router.delete('/music/:id', (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) {
    res.status(401).json({ error: 'Admin session required' });
    return;
  }

  const { id } = req.params;
  const tracks = readTracks();
  const idx = tracks.findIndex(t => t.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Track not found' });
    return;
  }
  tracks.splice(idx, 1);
  tracks.forEach((t, i) => { t.order = i; });
  writeTracks(tracks);
  res.sendStatus(204);
});

export default router;
