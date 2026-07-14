import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { isValidSessionToken, ADMIN_COOKIE_NAME } from '../lib/adminSession.js';

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
  heroText: 'Building things, breaking stuff.',
  currentStatus: 'Coding something',
  currentMood: 'Focused',
  currentGoal: 'Ship StudentHub Nepal',
  statusEmoji: '💻',
};

export function readSettings(): SiteSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8')) };
    }
  } catch {
    // fall through to defaults
  }
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
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) {
    res.status(401).json({ error: 'Admin session required' });
    return;
  }
  const current = readSettings();
  const updated: SiteSettings = { ...current, ...req.body };
  writeSettings(updated);
  res.json(updated);
});

export default router;
