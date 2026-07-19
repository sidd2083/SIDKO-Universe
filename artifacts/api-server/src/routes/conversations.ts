/**
 * Conversations — admin-side DM management.
 * Regular users write to Firestore directly via the Firebase client SDK.
 * These routes let the admin read all conversations and send replies.
 */
import { Router } from 'express';
import { getAdminFirestore } from '../lib/firebaseAdmin.js';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';
import { cached, invalidate } from '../lib/cache.js';

const router = Router();

function requireAdmin(req: any, res: any): boolean {
  if (!isValidSessionToken(extractAdminToken(req))) {
    res.status(401).json({ error: 'Admin required' });
    return false;
  }
  return true;
}

/** List all conversations (admin only) */
router.get('/conversations', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const snap = await getAdminFirestore().collection('conversations').get();
    const convos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    convos.sort((a: any, b: any) => {
      const aTime = a.lastAt?.seconds ?? 0;
      const bTime = b.lastAt?.seconds ?? 0;
      return bTime - aTime;
    });
    res.json(convos);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/** Get messages for one conversation (admin only) */
router.get('/conversations/:userId/messages', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const snap = await getAdminFirestore()
      .collection('conversations')
      .doc(req.params.userId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/** Admin sends a reply */
router.post('/conversations/:userId/messages', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const { text } = req.body as { text?: string };
  if (!text?.trim()) { res.status(400).json({ error: 'text required' }); return; }
  try {
    const db = getAdminFirestore();
    const convRef = db.collection('conversations').doc(req.params.userId);
    const convSnap = await convRef.get();
    if (!convSnap.exists) { res.status(404).json({ error: 'Conversation not found' }); return; }

    const msgRef = convRef.collection('messages').doc();
    const now = new Date();
    const msg = { id: msgRef.id, text: text.trim(), from: 'admin', createdAt: now.toISOString() };
    await msgRef.set(msg);
    await convRef.update({ lastMessage: text.trim(), lastAt: now, unread: false });

    invalidate(`conv_${req.params.userId}`);
    res.status(201).json(msg);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/** Mark conversation as read (admin) */
router.patch('/conversations/:userId', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    await getAdminFirestore()
      .collection('conversations')
      .doc(req.params.userId)
      .update({ unread: false });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
