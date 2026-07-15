import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { isValidSessionToken, ADMIN_COOKIE_NAME } from '../lib/adminSession.js';

const FILE = process.env.VERCEL === '1' ? '/tmp/sidko-guestbook.json' : path.resolve(process.cwd(), 'guestbook.json');

export interface GuestEntry { id: string; name: string; message: string; location?: string; createdAt: string; }

function read(): GuestEntry[] { try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch {} return []; }
function write(d: GuestEntry[]) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

const router = Router();

router.get('/guestbook', (_req, res): void => {
  res.json(read().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

router.post('/guestbook', (req, res): void => {
  const { name, message, location } = req.body as { name?: string; message?: string; location?: string };
  if (!name?.trim() || !message?.trim()) { res.status(400).json({ error: 'name and message required' }); return; }
  const entry: GuestEntry = { id: `gb_${Date.now()}`, name: name.trim(), message: message.trim(), location: location?.trim() || '', createdAt: new Date().toISOString() };
  const entries = read();
  entries.unshift(entry);
  write(entries);
  res.status(201).json(entry);
});

router.delete('/guestbook/:id', (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) { res.status(401).json({ error: 'Admin required' }); return; }
  const entries = read();
  const idx = entries.findIndex(e => e.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  entries.splice(idx, 1);
  write(entries);
  res.sendStatus(204);
});

export default router;
