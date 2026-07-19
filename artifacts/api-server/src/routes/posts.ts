import { Router } from 'express';
import { getAdminFirestore } from '../lib/firebaseAdmin.js';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';
import { cached, invalidate } from '../lib/cache.js';

export interface Post { id: string; title: string; slug: string; content: string; excerpt: string; coverImage?: string; readingTime: number; published: boolean; createdAt: string; }

const COL = 'posts';
const CACHE_KEY = 'posts';
const TTL = 60_000;

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

function requireAdmin(req: any, res: any): boolean {
  if (!isValidSessionToken(extractAdminToken(req))) { res.status(401).json({ error: 'Admin required' }); return false; }
  return true;
}

async function getAll(): Promise<Post[]> {
  return cached(CACHE_KEY, TTL, async () => {
    const snap = await getAdminFirestore().collection(COL).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
  });
}

const router = Router();

router.get('/posts', async (_req, res): Promise<void> => {
  try {
    const all = await getAll();
    res.json(all.filter(p => p.published).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get('/posts/all', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const all = await getAll();
    res.json(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get('/posts/:slug', async (req, res): Promise<void> => {
  try {
    const all = await getAll();
    const post = all.find(p => p.slug === req.params.slug || p.id === req.params.slug);
    if (!post) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(post);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post('/posts', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const { title, content, excerpt, coverImage, readingTime, published } = req.body as Partial<Post>;
  if (!title?.trim() || !content?.trim()) { res.status(400).json({ error: 'title and content required' }); return; }
  try {
    const id = `post_${Date.now()}`;
    const p: Post = { id, title: title.trim(), slug: slugify(title), content: content.trim(), excerpt: excerpt?.trim() || content.slice(0, 200), coverImage: coverImage || '', readingTime: readingTime || Math.ceil(content.length / 1000), published: published ?? false, createdAt: new Date().toISOString() };
    await getAdminFirestore().collection(COL).doc(id).set(p);
    invalidate(CACHE_KEY);
    res.status(201).json(p);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.patch('/posts/:id', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const ref = getAdminFirestore().collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) { res.status(404).json({ error: 'Not found' }); return; }
    const { id: _id, createdAt: _ca, ...updates } = req.body;
    await ref.update(updates);
    invalidate(CACHE_KEY);
    res.json({ id: doc.id, ...doc.data(), ...updates });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete('/posts/:id', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const ref = getAdminFirestore().collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) { res.status(404).json({ error: 'Not found' }); return; }
    await ref.delete();
    invalidate(CACHE_KEY);
    res.sendStatus(204);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
