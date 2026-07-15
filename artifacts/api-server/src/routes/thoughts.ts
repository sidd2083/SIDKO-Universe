import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { isValidSessionToken, ADMIN_COOKIE_NAME } from '../lib/adminSession.js';

const FILE = process.env.VERCEL === '1' ? '/tmp/sidko-thoughts.json' : path.resolve(process.cwd(), 'thoughts.json');

export interface Thought { id: string; title: string; content: string; mood: string; tags: string[]; readingTime: number; published: boolean; likesCount: number; createdAt: string; }

function read(): Thought[] { try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch {} return []; }
function write(d: Thought[]) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

const router = Router();

router.get('/thoughts', (_req, res): void => {
  res.json(read().filter(t => t.published).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

router.get('/thoughts/all', (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) { res.status(401).json({ error: 'Admin required' }); return; }
  res.json(read().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

router.get('/thoughts/:id', (req, res): void => {
  const t = read().find(t => t.id === req.params.id);
  if (!t) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(t);
});

router.post('/thoughts', (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) { res.status(401).json({ error: 'Admin required' }); return; }
  const { title, content, mood, tags, readingTime, published } = req.body as Partial<Thought>;
  if (!title?.trim() || !content?.trim()) { res.status(400).json({ error: 'title and content required' }); return; }
  const thoughts = read();
  const t: Thought = { id: `thought_${Date.now()}`, title: title.trim(), content: content.trim(), mood: mood || 'Thinking', tags: tags || [], readingTime: readingTime || Math.ceil(content.length / 1000), published: published ?? false, likesCount: 0, createdAt: new Date().toISOString() };
  thoughts.unshift(t);
  write(thoughts);
  res.status(201).json(t);
});

router.patch('/thoughts/:id', (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) { res.status(401).json({ error: 'Admin required' }); return; }
  const thoughts = read();
  const idx = thoughts.findIndex(t => t.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  thoughts[idx] = { ...thoughts[idx], ...req.body, id: thoughts[idx].id, createdAt: thoughts[idx].createdAt };
  write(thoughts);
  res.json(thoughts[idx]);
});

router.delete('/thoughts/:id', (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) { res.status(401).json({ error: 'Admin required' }); return; }
  const thoughts = read();
  const idx = thoughts.findIndex(t => t.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  thoughts.splice(idx, 1);
  write(thoughts);
  res.sendStatus(204);
});

export default router;
