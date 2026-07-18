import { Router } from 'express';
import { getAdminFirestore } from '../lib/firebaseAdmin.js';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';

export interface Milestone { title: string; done: boolean; }
export interface Goal { id: string; title: string; description: string; progress: number; targetDate: string; milestones: Milestone[]; order: number; createdAt: string; }

const COL = 'goals';

function requireAdmin(req: any, res: any): boolean {
  if (!isValidSessionToken(extractAdminToken(req))) { res.status(401).json({ error: 'Admin required' }); return false; }
  return true;
}

async function getAll(): Promise<Goal[]> {
  const snap = await getAdminFirestore().collection(COL).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Goal));
}

const router = Router();

router.get('/goals', async (_req, res): Promise<void> => {
  try {
    const goals = await getAll();
    res.json(goals.sort((a, b) => a.order - b.order));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post('/goals', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const { title, description, progress, targetDate, milestones } = req.body as Partial<Goal>;
  if (!title?.trim()) { res.status(400).json({ error: 'title required' }); return; }
  try {
    const existing = await getAll();
    const id = `goal_${Date.now()}`;
    const g: Goal = { id, title: title.trim(), description: description?.trim() || '', progress: progress ?? 0, targetDate: targetDate || '', milestones: milestones || [], order: existing.length, createdAt: new Date().toISOString() };
    await getAdminFirestore().collection(COL).doc(id).set(g);
    res.status(201).json(g);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.patch('/goals/:id', async (req, res): Promise<void> => {
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

router.delete('/goals/:id', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const ref = getAdminFirestore().collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) { res.status(404).json({ error: 'Not found' }); return; }
    await ref.delete();
    const remaining = (await getAll()).sort((a, b) => a.order - b.order);
    const batch = getAdminFirestore().batch();
    remaining.forEach((g, i) => batch.update(getAdminFirestore().collection(COL).doc(g.id), { order: i }));
    await batch.commit();
    res.sendStatus(204);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
