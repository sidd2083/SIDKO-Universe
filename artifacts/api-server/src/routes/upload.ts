import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { isValidSessionToken, extractAdminToken } from '../lib/adminSession.js';
import { getAdminStorage, isFirebaseAdminConfigured } from '../lib/firebaseAdmin.js';

// Bucket name derived from project ID — e.g. sidhub-a359f.firebasestorage.app
const STORAGE_BUCKET = `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`;

// Use memory storage — files are held in RAM and pushed to Firebase Storage
const upload = multer({
  storage: multer.memoryStorage(),
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

/** Upload a file — requires valid admin session, stores in Firebase Storage */
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
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No file received' });
      return;
    }

    if (!isFirebaseAdminConfigured) {
      res.status(503).json({
        error: 'FIREBASE_SERVICE_ACCOUNT_KEY is not configured — uploads are unavailable.',
      });
      return;
    }

    try {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

      const bucket = getAdminStorage().bucket(STORAGE_BUCKET);
      const fileRef = bucket.file(filename);

      await fileRef.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
      });

      // Make the file publicly readable so it can be embedded directly in pages
      await fileRef.makePublic();

      // Public GCS URL — no expiry, no tokens needed
      const url = `https://storage.googleapis.com/${STORAGE_BUCKET}/${filename}`;
      res.json({ url });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: `Upload failed: ${message}` });
    }
  },
);

export default router;
