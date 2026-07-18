import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';

const FILE =
  process.env.VERCEL === '1'
    ? '/tmp/sidko-goals.json'
    : path.resolve(process.cwd(), 'goals.json');

export interface Milestone { title: string; done: boolean; }
export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  targetDate: string;
  milestones: Milestone[];
  order: number;
  createdAt: string;
}

function read(): Goal[] { try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch {} return []; }
function write(d: Goal[]) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

function requireAdmin(req: any, res: any): boolean {
  if (!isValidSessionToken(extractAdminToken(req))) {
    res.status(401).json({ error: 'Admin required' });
    return false;
  }
  return true;
}

const router = Router();

/** Public read */
router.get('/goals', (_req, res): void => {
  res.json(read().sort((a, b) => a.order - b.order));
});

router.post('/goals', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  const { title, description, progress, targetDate, milestones } = req.body as Partial<Goal>;
  if (!title?.trim()) { res.status(400).json({ error: 'title required' }); return; }
  const goals = read();
  const g: Goal = {
    id: `goal_${Date.now()}`,
    title: title.trim(),
    description: description?.trim() || '',
    progress: progress ?? 0,
    targetDate: targetDate || '',
    milestones: milestones || [],
    order: goals.length,
    createdAt: new Date().toISOString(),
  };
  goals.push(g);
  write(goals);
  res.status(201).json(g);
});

router.patch('/goals/:id', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  const goals = read();
  const idx = goals.findIndex(g => g.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  goals[idx] = { ...goals[idx], ...req.body, id: goals[idx].id, createdAt: goals[idx].createdAt, order: goals[idx].order };
  write(goals);
  res.json(goals[idx]);
});

router.delete('/goals/:id', (req, res): void => {
  if (!requireAdmin(req, res)) return;
  const goals = read();
  const idx = goals.findIndex(g => g.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  goals.splice(idx, 1);
  goals.forEach((g, i) => { g.order = i; });
  write(goals);
  res.sendStatus(204);
});

export default router;
