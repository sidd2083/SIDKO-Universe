import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';

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
  } catch {}
  return [];
}

function writeTracks(tracks: Track[]): void {
  fs.writeFileSync(MUSIC_FILE, JSON.stringify(tracks, null, 2), 'utf-8');
}

function requireAdmin(req: any, res: any): boolean {
  if (!isValidSessionToken(extractAdminToken(req))) {
    res.status(401).json({ error: 'Admin session required' });
    return false;
  }
  return true;
}

const router = Router();

router.get('/music', (_req, res): void => {
  res.json(readTracks().sort((a, b) => a.order - b.order));
});

router.post('/music', (req, res): void => {
  if (!requireAdmin(req, res)) return;
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
  if (!requireAdmin(req, res)) return;
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
