/**
 * /api/upload — kept for backward compatibility but images now go through
 * client-side Canvas compression and are stored as base64 data URLs in Firestore.
 * This route is no longer the primary upload path.
 */
import { Router } from 'express';
const router = Router();

router.post('/upload', (_req, res) => {
  res.status(410).json({
    error: 'Direct file upload is disabled. Images are compressed client-side and stored as data URLs.',
  });
});

export default router;
