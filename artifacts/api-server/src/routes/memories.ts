import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';

const FILE = process.env.VERCEL === '1' ? '/tmp/sidko-memories.json' : path.resolve(process.cwd(), 'memories.json');

export interface Memory { id: string; title: string; description: string; images: string[]; category: string; mood: string; date: string; location: string; tags: string[]; featured: boolean; pinned: boolean; createdAt: string; }

function read(): Memory[] { try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch {} return []; }
function write(d: Memory[]) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

function requireAdmin(req: any, res: any): boolean {
  if (!isValidSessionToken(extractAdminToken(req))) {
    res.status(401).json({ error: 'Admin required' });
    return false;
  }
  return true;
}

const router = Router();

router.get('/memories', (_req, res): void => {
  res.json(read().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

router.get('/memories/:id', (req, res): void => {
  const m = read().find(m => m.id === req.params.id);
  if (!m) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(m);
});

router.post('/memories', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  const { title, description, images, category, mood, date, location, tags, featured, pinned } = req.body as Partial<Memory>;
  if (!title?.trim()) { res.status(400).json({ error: 'title required' }); return; }
  const memories = read();
  const m: Memory = { id: `mem_${Date.now()}`, title: title.trim(), description: description?.trim() || '', images: images || [], category: category || 'General', mood: mood || 'Happy', date: date || new Date().toISOString().split('T')[0], location: location?.trim() || '', tags: tags || [], featured: featured ?? false, pinned: pinned ?? false, createdAt: new Date().toISOString() };
  memories.unshift(m);
  write(memories);
  res.status(201).json(m);
});

router.patch('/memories/:id', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  const memories = read();
  const idx = memories.findIndex(m => m.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  memories[idx] = { ...memories[idx], ...req.body, id: memories[idx].id, createdAt: memories[idx].createdAt };
  write(memories);
  res.json(memories[idx]);
});

router.delete('/memories/:id', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  const memories = read();
  const idx = memories.findIndex(m => m.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  memories.splice(idx, 1);
  write(memories);
  res.sendStatus(204);
});

export default router;
