import { Router } from 'express';
import { getAdminFirestore } from '../lib/firebaseAdmin.js';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';

export interface Thought { id: string; title: string; content: string; mood: string; tags: string[]; readingTime: number; published: boolean; likesCount: number; createdAt: string; }

const COL = 'thoughts';

function requireAdmin(req: any, res: any): boolean {
  if (!isValidSessionToken(extractAdminToken(req))) { res.status(401).json({ error: 'Admin required' }); return false; }
  return true;
}

async function getAll(): Promise<Thought[]> {
  const snap = await getAdminFirestore().collection(COL).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Thought));
}

const router = Router();

router.get('/thoughts', async (_req, res): Promise<void> => {
  try {
    const all = await getAll();
    res.json(all.filter(t => t.published).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get('/thoughts/all', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const all = await getAll();
    res.json(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get('/thoughts/:id', async (req, res): Promise<void> => {
  try {
    const doc = await getAdminFirestore().collection(COL).doc(req.params.id).get();
    if (!doc.exists) { res.status(404).json({ error: 'Not found' }); return; }
    res.json({ id: doc.id, ...doc.data() });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post('/thoughts', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const { title, content, mood, tags, readingTime, published } = req.body as Partial<Thought>;
  if (!title?.trim() || !content?.trim()) { res.status(400).json({ error: 'title and content required' }); return; }
  try {
    const id = `thought_${Date.now()}`;
    const t: Thought = { id, title: title.trim(), content: content.trim(), mood: mood || 'Thinking', tags: tags || [], readingTime: readingTime || Math.ceil(content.length / 1000), published: published ?? false, likesCount: 0, createdAt: new Date().toISOString() };
    await getAdminFirestore().collection(COL).doc(id).set(t);
    res.status(201).json(t);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.patch('/thoughts/:id', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const ref = getAdminFirestore().collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) { res.status(404).json({ error: 'Not found' }); return; }
    const { id: _id, createdAt: _ca, ...updates } = req.body;
    await ref.update(updates);
    res.json({ id: doc.id, ...doc.data(), ...updates });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete('/thoughts/:id', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const ref = getAdminFirestore().collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) { res.status(404).json({ error: 'Not found' }); return; }
    await ref.delete();
    res.sendStatus(204);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
