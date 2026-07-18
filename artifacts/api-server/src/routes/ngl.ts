import { Router } from 'express';
import { getAdminFirestore } from '../lib/firebaseAdmin.js';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';

export interface NglMessage { id: string; question: string; approved: boolean; pinned: boolean; reply?: string; createdAt: string; }

const COL = 'ngl';

function requireAdmin(req: any, res: any): boolean {
  if (!isValidSessionToken(extractAdminToken(req))) { res.status(401).json({ error: 'Admin required' }); return false; }
  return true;
}

async function getAll(): Promise<NglMessage[]> {
  const snap = await getAdminFirestore().collection(COL).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as NglMessage));
}

const router = Router();

// Public: only approved messages
router.get('/ngl', async (_req, res): Promise<void> => {
  try {
    const all = await getAll();
    res.json(
      all
        .filter(m => m.approved)
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Admin: all messages
router.get('/ngl/all', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const all = await getAll();
    res.json(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Public: anyone can submit a question
router.post('/ngl', async (req, res): Promise<void> => {
  const { question } = req.body as { question?: string };
  if (!question?.trim()) { res.status(400).json({ error: 'question required' }); return; }
  try {
    const id = `ngl_${Date.now()}`;
    const m: NglMessage = { id, question: question.trim(), approved: false, pinned: false, createdAt: new Date().toISOString() };
    await getAdminFirestore().collection(COL).doc(id).set(m);
    res.status(201).json(m);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Admin: approve / reply / pin
router.patch('/ngl/:id', async (req, res): Promise<void> => {
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

// Admin: delete
router.delete('/ngl/:id', async (req, res): Promise<void> => {
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
