import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';

const FILE = process.env.VERCEL === '1' ? '/tmp/sidko-ngl.json' : path.resolve(process.cwd(), 'ngl.json');

export interface NglMessage { id: string; question: string; approved: boolean; pinned: boolean; reply?: string; createdAt: string; }

function read(): NglMessage[] { try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch {} return []; }
function write(d: NglMessage[]) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

function requireAdmin(req: any, res: any): boolean {
  if (!isValidSessionToken(extractAdminToken(req))) {
    res.status(401).json({ error: 'Admin required' });
    return false;
  }
  return true;
}

const router = Router();

router.get('/ngl', (_req, res): void => {
  res.json(read().filter(m => m.approved).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

router.get('/ngl/all', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  res.json(read().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

router.post('/ngl', (req, res): void => {
  const { question } = req.body as { question?: string };
  if (!question?.trim()) { res.status(400).json({ error: 'question required' }); return; }
  const msgs = read();
  const m: NglMessage = { id: `ngl_${Date.now()}`, question: question.trim(), approved: false, pinned: false, createdAt: new Date().toISOString() };
  msgs.unshift(m);
  write(msgs);
  res.status(201).json(m);
});

router.patch('/ngl/:id', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  const msgs = read();
  const idx = msgs.findIndex(m => m.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  msgs[idx] = { ...msgs[idx], ...req.body, id: msgs[idx].id, createdAt: msgs[idx].createdAt };
  write(msgs);
  res.json(msgs[idx]);
});

router.delete('/ngl/:id', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  const msgs = read();
  const idx = msgs.findIndex(m => m.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  msgs.splice(idx, 1);
  write(msgs);
  res.sendStatus(204);
});

export default router;
