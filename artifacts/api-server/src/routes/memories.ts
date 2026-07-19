import { Router } from 'express';
import { getAdminFirestore } from '../lib/firebaseAdmin.js';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';
import { cached, invalidate } from '../lib/cache.js';

export interface Memory { id: string; title: string; description: string; images: string[]; category: string; mood: string; date: string; location: string; tags: string[]; featured: boolean; pinned: boolean; createdAt: string; }

const COL = 'memories';
const CACHE_KEY = 'memories';
const TTL = 60_000; // 60 seconds

function requireAdmin(req: any, res: any): boolean {
  if (!isValidSessionToken(extractAdminToken(req))) { res.status(401).json({ error: 'Admin required' }); return false; }
  return true;
}

async function getAll(): Promise<Memory[]> {
  return cached(CACHE_KEY, TTL, async () => {
    const snap = await getAdminFirestore().collection(COL).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Memory));
  });
}

const router = Router();

router.get('/memories', async (_req, res): Promise<void> => {
  try {
    const all = await getAll();
    res.json(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get('/memories/:id', async (req, res): Promise<void> => {
  try {
    const all = await getAll();
    const mem = all.find(m => m.id === req.params.id);
    if (!mem) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(mem);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post('/memories', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const { title, description, images, category, mood, date, location, tags, featured, pinned } = req.body as Partial<Memory>;
  if (!title?.trim()) { res.status(400).json({ error: 'title required' }); return; }
  try {
    const id = `mem_${Date.now()}`;
    const m: Memory = { id, title: title.trim(), description: description?.trim() || '', images: images || [], category: category || 'General', mood: mood || 'Happy', date: date || new Date().toISOString().split('T')[0], location: location?.trim() || '', tags: tags || [], featured: featured ?? false, pinned: pinned ?? false, createdAt: new Date().toISOString() };
    await getAdminFirestore().collection(COL).doc(id).set(m);
    invalidate(CACHE_KEY);
    res.status(201).json(m);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.patch('/memories/:id', async (req, res): Promise<void> => {
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

router.delete('/memories/:id', async (req, res): Promise<void> => {
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
