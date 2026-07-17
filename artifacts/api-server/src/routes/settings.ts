import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';

const SETTINGS_FILE =
  process.env.VERCEL === '1'
    ? '/tmp/sidko-settings.json'
    : path.resolve(process.cwd(), 'settings.json');

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

export function readSettings(): SiteSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8')) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

function writeSettings(data: SiteSettings): void {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const router = Router();

router.get('/settings', (_req, res): void => {
  res.json(readSettings());
});

router.put('/settings', (req, res): void => {
  if (!isValidSessionToken(extractAdminToken(req))) {
    res.status(401).json({ error: 'Admin session required' });
    return;
  }
  const parsed = SettingsUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid settings', details: parsed.error.flatten() });
    return;
  }
  const current = readSettings();
  const updated: SiteSettings = { ...current, ...parsed.data };
  writeSettings(updated);
  res.json(updated);
});

export default router;
