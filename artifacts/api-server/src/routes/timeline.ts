import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';

const FILE =
  process.env.VERCEL === '1'
    ? '/tmp/sidko-timeline.json'
    : path.resolve(process.cwd(), 'timeline.json');

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  year: string;
  category: 'milestone' | 'achievement' | 'memory' | 'project' | 'other';
  location?: string;
  highlight?: boolean;
  emoji?: string;
  createdAt: string;
}

function read(): TimelineEvent[] { try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch {} return []; }
function write(d: TimelineEvent[]) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

function requireAdmin(req: any, res: any): boolean {
  if (!isValidSessionToken(extractAdminToken(req))) {
    res.status(401).json({ error: 'Admin required' });
    return false;
  }
  return true;
}

const router = Router();

/** Public read — sorted newest first */
router.get('/timeline', (_req, res): void => {
  res.json(read().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
});

router.post('/timeline', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  const { title, description, date, category, location, highlight, emoji } = req.body as Partial<TimelineEvent>;
  if (!title?.trim() || !date) { res.status(400).json({ error: 'title and date required' }); return; }
  const events = read();
  const ev: TimelineEvent = {
    id: `ev_${Date.now()}`,
    title: title.trim(),
    description: description?.trim() || '',
    date,
    year: new Date(date).getFullYear().toString(),
    category: (category as TimelineEvent['category']) || 'milestone',
    location: location?.trim() || '',
    highlight: highlight ?? false,
    emoji: emoji || '',
    createdAt: new Date().toISOString(),
  };
  events.unshift(ev);
  write(events);
  res.status(201).json(ev);
});

router.patch('/timeline/:id', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  const events = read();
  const idx = events.findIndex(e => e.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  const updated = { ...events[idx], ...req.body, id: events[idx].id, createdAt: events[idx].createdAt };
  // Recalculate year if date changed
  if (req.body.date) updated.year = new Date(req.body.date).getFullYear().toString();
  events[idx] = updated;
  write(events);
  res.json(events[idx]);
});

router.delete('/timeline/:id', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  const events = read();
  const idx = events.findIndex(e => e.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  events.splice(idx, 1);
  write(events);
  res.sendStatus(204);
});

export default router;
