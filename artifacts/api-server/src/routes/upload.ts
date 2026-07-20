import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';

// Resolve uploads dir — same logic as app.ts
const UPLOADS_DIR =
  process.env.VERCEL === '1'
    ? '/tmp/uploads'
    : path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Store files directly on disk — Replit workspace filesystem is persistent
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isAudio =
      file.mimetype.startsWith('audio/') ||
      file.mimetype === 'application/octet-stream';
    if (isImage || isAudio) {
      cb(null, true);
    } else {
      cb(new Error(`File type "${file.mimetype}" is not allowed`));
    }
  },
});

const router = Router();

/** Upload a file — requires valid admin session, stored on disk */
router.post(
  '/upload',
  (req, res, next) => {
    const token = extractAdminToken(req as Parameters<typeof extractAdminToken>[0]);
    if (!isValidSessionToken(token)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    next();
  },
  upload.single('file'),
  (req, res): void => {
    if (!req.file) {
      res.status(400).json({ error: 'No file received' });
      return;
    }

    // Build absolute URL using the public-facing host.
    // Replit/Vercel proxies set X-Forwarded-Host; fall back to Host header.
    // trust proxy: 1 ensures req.protocol already reflects X-Forwarded-Proto.
    const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:8080';
    const url = `${req.protocol}://${host}/api/uploads/${req.file.filename}`;

    res.json({ url });
  },
);

export default router;
