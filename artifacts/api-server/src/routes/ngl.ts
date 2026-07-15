import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { isValidSessionToken, ADMIN_COOKIE_NAME } from '../lib/adminSession.js';

const FILE = process.env.VERCEL === '1' ? '/tmp/sidko-ngl.json' : path.resolve(process.cwd(), 'ngl.json');

export interface NglMessage { id: string; question: string; approved: boolean; pinned: boolean; reply?: string; createdAt: string; }

function read(): NglMessage[] { try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch {} return []; }
function write(d: NglMessage[]) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

const router = Router();

// Public: get approved messages
router.get('/ngl', (_req, res): void => {
  const msgs = read().filter(m => m.approved).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(msgs);
});

// Admin: get all (including unapproved)
router.get('/ngl/all', (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) { res.status(401).json({ error: 'Admin required' }); return; }
  res.json(read().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

// Public: submit a question
router.post('/ngl', (req, res): void => {
  const { question } = req.body as { question?: string };
  if (!question?.trim()) { res.status(400).json({ error: 'question required' }); return; }
  const msgs = read();
  const msg: NglMessage = { id: `ngl_${Date.now()}`, question: question.trim(), approved: false, pinned: false, reply: '', createdAt: new Date().toISOString() };
  msgs.unshift(msg);
  write(msgs);
  res.status(201).json({ ok: true });
});

// Admin: update (approve, reply, pin)
router.patch('/ngl/:id', (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) { res.status(401).json({ error: 'Admin required' }); return; }
  const msgs = read();
  const idx = msgs.findIndex(m => m.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  const { approved, pinned, reply } = req.body as Partial<NglMessage>;
  if (approved !== undefined) msgs[idx].approved = approved;
  if (pinned !== undefined) msgs[idx].pinned = pinned;
  if (reply !== undefined) msgs[idx].reply = reply;
  write(msgs);
  res.json(msgs[idx]);
});

// Admin: delete
router.delete('/ngl/:id', (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) { res.status(401).json({ error: 'Admin required' }); return; }
  const msgs = read();
  const idx = msgs.findIndex(m => m.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  msgs.splice(idx, 1);
  write(msgs);
  res.sendStatus(204);
});

export default router;
