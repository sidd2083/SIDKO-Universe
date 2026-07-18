import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';

const FILE =
  process.env.VERCEL === '1'
    ? '/tmp/sidko-journal.json'
    : path.resolve(process.cwd(), 'journal.json');

export interface JournalEntry {
  id: string;
  content: string;
  mood: string;
  dateStr: string;
  createdAt: string;
}

function read(): JournalEntry[] { try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch {} return []; }
function write(d: JournalEntry[]) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

function requireAdmin(req: any, res: any): boolean {
  if (!isValidSessionToken(extractAdminToken(req))) {
    res.status(401).json({ error: 'Admin required' });
    return false;
  }
  return true;
}

const router = Router();

router.get('/journal', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  res.json(read().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

router.post('/journal', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  const { content, mood } = req.body as Partial<JournalEntry>;
  if (!content?.trim()) { res.status(400).json({ error: 'content required' }); return; }
  const now = new Date();
  const entry: JournalEntry = {
    id: `journal_${Date.now()}`,
    content: content.trim(),
    mood: mood || 'Neutral',
    dateStr: now.toISOString().split('T')[0],
    createdAt: now.toISOString(),
  };
  const entries = read();
  entries.unshift(entry);
  write(entries);
  res.status(201).json(entry);
});

router.delete('/journal/:id', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  const entries = read();
  const idx = entries.findIndex(e => e.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  entries.splice(idx, 1);
  write(entries);
  res.sendStatus(204);
});

export default router;
