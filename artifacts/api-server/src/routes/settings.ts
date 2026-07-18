import { Router } from 'express';
import { z } from 'zod';
import { getAdminFirestore } from '../lib/firebaseAdmin.js';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';

export interface SiteSettings {
  heroText: string;
  currentStatus: string;
  currentMood: string;
  currentGoal: string;
  statusEmoji: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  heroText: 'Figuring life out, one day at a time.',
  currentStatus: 'Coding something',
  currentMood: 'Focused',
  currentGoal: 'Live a happy, meaningful life',
  statusEmoji: '💻',
};

const SettingsUpdateSchema = z.object({
  heroText: z.string().min(1).max(300).optional(),
  currentStatus: z.string().min(1).max(100).optional(),
  currentMood: z.string().min(1).max(100).optional(),
  currentGoal: z.string().min(1).max(300).optional(),
  statusEmoji: z.string().min(1).max(10).optional(),
});

const DOC = () => getAdminFirestore().collection('settings').doc('main');

export async function readSettings(): Promise<SiteSettings> {
  try {
    const doc = await DOC().get();
    if (doc.exists) return { ...DEFAULT_SETTINGS, ...doc.data() } as SiteSettings;
  } catch {}
  return DEFAULT_SETTINGS;
}

const router = Router();

router.get('/settings', async (_req, res): Promise<void> => {
  try {
    res.json(await readSettings());
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put('/settings', async (req, res): Promise<void> => {
  if (!isValidSessionToken(extractAdminToken(req))) {
    res.status(401).json({ error: 'Admin session required' }); return;
  }
  const parsed = SettingsUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Invalid settings', details: parsed.error.flatten() }); return; }
  try {
    const current = await readSettings();
    const updated: SiteSettings = { ...current, ...parsed.data };
    await DOC().set(updated);
    res.json(updated);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
