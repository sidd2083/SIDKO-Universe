import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { isValidSessionToken } from '../lib/adminSession.js';
import { ADMIN_COOKIE_NAME } from '../lib/adminSession.js';

// On Vercel, use /tmp (ephemeral). Locally, use ./uploads (persistent).
const UPLOADS_DIR =
  process.env.VERCEL === '1'
    ? '/tmp/uploads'
    : path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /^(image\/(jpeg|png|webp|gif)|audio\/(mp3|mpeg))$/;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type "${file.mimetype}" is not allowed`));
    }
  },
});

const router = Router();

/** Serve uploaded files */
router.get('/uploads/:filename', (req, res): void => {
  const filename = path.basename(req.params.filename); // sanitize
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  res.sendFile(filePath);
});

/** Upload a file — admin only */
router.post('/upload', (req, res, next) => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) {
    res.status(401).json({ error: 'Admin session required' });
    return;
  }
  next();
}, upload.single('file'), (req, res): void => {
  if (!req.file) {
    res.status(400).json({ error: 'No file received' });
    return;
  }
  const url = `/api/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router;
