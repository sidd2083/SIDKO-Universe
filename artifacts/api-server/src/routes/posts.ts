import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { isValidSessionToken, ADMIN_COOKIE_NAME } from '../lib/adminSession.js';

const FILE = process.env.VERCEL === '1' ? '/tmp/sidko-posts.json' : path.resolve(process.cwd(), 'posts.json');

export interface Post { id: string; title: string; slug: string; content: string; excerpt: string; coverImage?: string; readingTime: number; published: boolean; createdAt: string; }

function read(): Post[] { try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch {} return []; }
function write(d: Post[]) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }
function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

const router = Router();

router.get('/posts', (_req, res): void => {
  res.json(read().filter(p => p.published).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

router.get('/posts/all', (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) { res.status(401).json({ error: 'Admin required' }); return; }
  res.json(read().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

router.get('/posts/:id', (req, res): void => {
  const p = read().find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!p) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(p);
});

router.post('/posts', (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) { res.status(401).json({ error: 'Admin required' }); return; }
  const { title, content, excerpt, coverImage, readingTime, published } = req.body as Partial<Post>;
  if (!title?.trim() || !content?.trim()) { res.status(400).json({ error: 'title and content required' }); return; }
  const posts = read();
  const p: Post = { id: `post_${Date.now()}`, title: title.trim(), slug: slugify(title), content: content.trim(), excerpt: excerpt?.trim() || content.slice(0, 200), coverImage: coverImage || '', readingTime: readingTime || Math.ceil(content.length / 1000), published: published ?? false, createdAt: new Date().toISOString() };
  posts.unshift(p);
  write(posts);
  res.status(201).json(p);
});

router.patch('/posts/:id', (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) { res.status(401).json({ error: 'Admin required' }); return; }
  const posts = read();
  const idx = posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  posts[idx] = { ...posts[idx], ...req.body, id: posts[idx].id, createdAt: posts[idx].createdAt };
  write(posts);
  res.json(posts[idx]);
});

router.delete('/posts/:id', (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) { res.status(401).json({ error: 'Admin required' }); return; }
  const posts = read();
  const idx = posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  posts.splice(idx, 1);
  write(posts);
  res.sendStatus(204);
});

export default router;
