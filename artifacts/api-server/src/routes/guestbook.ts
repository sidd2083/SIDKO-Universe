import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';

const FILE = process.env.VERCEL === '1' ? '/tmp/sidko-guestbook.json' : path.resolve(process.cwd(), 'guestbook.json');

export interface GuestEntry { id: string; name: string; message: string; emoji: string; approved: boolean; createdAt: string; }

function read(): GuestEntry[] { try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch {} return []; }
function write(d: GuestEntry[]) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

const router = Router();

router.get('/guestbook', (_req, res): void => {
  res.json(read().filter(e => e.approved).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

router.post('/guestbook', (req, res): void => {
  const { name, message, emoji } = req.body as Partial<GuestEntry>;
  if (!name?.trim() || !message?.trim()) { res.status(400).json({ error: 'name and message required' }); return; }
  const entries = read();
  const e: GuestEntry = { id: `guest_${Date.now()}`, name: name.trim().slice(0, 50), message: message.trim().slice(0, 500), emoji: emoji || '👋', approved: false, createdAt: new Date().toISOString() };
  entries.unshift(e);
  write(entries);
  res.status(201).json(e);
});

router.patch('/guestbook/:id', (req, res): void => {
  if (!isValidSessionToken(extractAdminToken(req))) { res.status(401).json({ error: 'Admin required' }); return; }
  const entries = read();
  const idx = entries.findIndex(e => e.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  entries[idx] = { ...entries[idx], ...req.body, id: entries[idx].id, createdAt: entries[idx].createdAt };
  write(entries);
  res.json(entries[idx]);
});

router.delete('/guestbook/:id', (req, res): void => {
  if (!isValidSessionToken(extractAdminToken(req))) { res.status(401).json({ error: 'Admin required' }); return; }
  const entries = read();
  const idx = entries.findIndex(e => e.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  entries.splice(idx, 1);
  write(entries);
  res.sendStatus(204);
});

export default router;
