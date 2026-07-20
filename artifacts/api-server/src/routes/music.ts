import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getAdminFirestore } from '../lib/firebaseAdmin.js';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';
import { cached, invalidate } from '../lib/cache.js';

export interface Track { id: string; title: string; url: string; coverImage?: string; order: number; }

const COL = 'music';
const CACHE_KEY = 'music';
const TTL = 60_000;

// Uploads directory (matches app.ts static serving under /api/uploads)
const UPLOADS_DIR =
  process.env.VERCEL === '1'
    ? '/tmp/uploads'
    : path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer — store audio files on disk, limit 30 MB
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp3';
    cb(null, `music_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.mp3', '.ogg', '.wav', '.m4a', '.flac', '.aac'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

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

/** POST /api/music/upload — upload an audio file directly from disk */
router.post('/music/upload', (req, res, next) => {
  if (!requireAdmin(req, res)) return;
  next();
}, upload.single('file'), async (req: any, res: any): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No audio file received' }); return; }

    const { title } = req.body as { title?: string };
    if (!title?.trim()) {
      fs.unlink(req.file.path, () => {});
      res.status(400).json({ error: 'title is required' });
      return;
    }

    // Build a public URL that the browser can stream
    const baseUrl = process.env.API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 8080}`;
    const fileUrl = `${baseUrl}/api/uploads/${req.file.filename}`;

    const existing = await getAll();
    const id = `track_${Date.now()}`;
    const newTrack: Track = {
      id,
      title: title.trim(),
      url: fileUrl,
      coverImage: '',
      order: existing.length,
    };
    await getAdminFirestore().collection(COL).doc(id).set(newTrack);
    invalidate(CACHE_KEY);
    res.status(201).json(newTrack);
  } catch (e: any) {
    res.status(500).json({ error: String(e) });
  }
});

router.delete('/music/:id', async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const ref = getAdminFirestore().collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) { res.status(404).json({ error: 'Track not found' }); return; }

    // Delete local file if it lives in uploads dir
    const data = doc.data() as Track | undefined;
    if (data?.url?.includes('/api/uploads/')) {
      const filename = path.basename(data.url);
      const filePath = path.join(UPLOADS_DIR, filename);
      fs.unlink(filePath, () => {});
    }

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
