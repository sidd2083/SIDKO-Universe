import { Router } from 'express';
import { getAdminFirestore } from '../lib/firebaseAdmin.js';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';
import { cached, invalidate } from '../lib/cache.js';

export interface Track { id: string; title: string; url: string; coverImage?: string; order: number; }

const COL = 'music';
const CACHE_KEY = 'music';
const TTL = 60_000;

function requireAdmin(req: any, res: any): boolean {
  if (!isValidSessionToken(extractAdminToken(req))) { res.status(401).json({ error: 'Admin session required' }); return false; }
  return true;
}

async function getAll(): Promise<Track[]> {
  return cached(CACHE_KEY, TTL, async () => {
    const snap = await getAdminFirestore().collection(COL).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Track));
  });
}

const router = Router();

router.get('/music', async (_req, res): Promise<void> => {
  try {
    const tracks = await getAll();
    res.json(tracks.sort((a, b) => a.order - b.order));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post('/music', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const { title, url, coverImage } = req.body as Partial<Track>;
  if (!title || !url) { res.status(400).json({ error: 'title and url are required' }); return; }
  try {
    const existing = await getAll();
    const id = `track_${Date.now()}`;
    const newTrack: Track = { id, title: title.trim(), url, coverImage: coverImage ?? '', order: existing.length };
    await getAdminFirestore().collection(COL).doc(id).set(newTrack);
    invalidate(CACHE_KEY);
    res.status(201).json(newTrack);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete('/music/:id', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const ref = getAdminFirestore().collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) { res.status(404).json({ error: 'Track not found' }); return; }
    await ref.delete();
    invalidate(CACHE_KEY);
    // Re-number order for remaining tracks
    const remaining = (await getAdminFirestore().collection(COL).get()).docs
      .map(d => ({ id: d.id, ...d.data() } as Track))
      .sort((a, b) => a.order - b.order);
    const batch = getAdminFirestore().batch();
    remaining.forEach((t, i) => batch.update(getAdminFirestore().collection(COL).doc(t.id), { order: i }));
    await batch.commit();
    res.sendStatus(204);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
