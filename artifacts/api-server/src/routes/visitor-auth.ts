/**
 * Visitor registration and login via Firebase Admin SDK custom tokens.
 * This bypasses the Firebase Email/Password provider requirement —
 * the Admin SDK can create users regardless of which auth providers are enabled.
 * Passwords are verified server-side using a SHA-256 hash stored in Firestore.
 */
import { Router } from 'express';
import { createHash } from 'crypto';
import rateLimit from 'express-rate-limit';
import { getAdminAuth, getAdminFirestore, isFirebaseAdminConfigured } from '../lib/firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
});

/** Deterministic password hash — not stored in plain text. */
function hashPassword(password: string): string {
  return createHash('sha256')
    .update(`sidkouniverse:${password}:visitor`)
    .digest('hex');
}

/** POST /api/visitor/register */
router.post('/visitor/register', authLimiter, async (req, res): Promise<void> => {
  if (!isFirebaseAdminConfigured) {
    res.status(503).json({ error: 'Visitor accounts are not available yet.' });
    return;
  }

  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
    res.status(400).json({ error: 'username and password are required.' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!cleanUsername) {
    res.status(400).json({ error: 'Username must contain letters or numbers.' });
    return;
  }
  const email = `${cleanUsername}@sidkouniverse.local`;

  try {
    // Create Firebase Auth user via Admin SDK (no Email/Password provider needed)
    const userRecord = await getAdminAuth().createUser({ email, displayName: cleanUsername });

    // Store user profile + hashed password in Firestore
    await getAdminFirestore().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      username: cleanUsername,
      passwordHash: hashPassword(password),
      createdAt: FieldValue.serverTimestamp(),
      bookmarks: [],
      likedMemories: [],
      likedThoughts: [],
    });

    // Return a custom token the client exchanges for a Firebase ID token
    const customToken = await getAdminAuth().createCustomToken(userRecord.uid);
    res.status(201).json({ customToken });
  } catch (err: any) {
    if (err.code === 'auth/email-already-exists') {
      res.status(409).json({ error: 'Username is already taken.' });
      return;
    }
    res.status(500).json({ error: err.message ?? 'Registration failed.' });
  }
});

/** POST /api/visitor/login */
router.post('/visitor/login', authLimiter, async (req, res): Promise<void> => {
  if (!isFirebaseAdminConfigured) {
    res.status(503).json({ error: 'Visitor accounts are not available yet.' });
    return;
  }

  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
    res.status(400).json({ error: 'username and password are required.' });
    return;
  }

  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
  const email = `${cleanUsername}@sidkouniverse.local`;

  try {
    // Fetch Firebase Auth user
    const userRecord = await getAdminAuth().getUserByEmail(email);

    // Verify password from Firestore
    const snap = await getAdminFirestore().collection('users').doc(userRecord.uid).get();
    if (!snap.exists) {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }
    const data = snap.data()!;
    if (data.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }

    const customToken = await getAdminAuth().createCustomToken(userRecord.uid);
    res.json({ customToken });
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }
    res.status(500).json({ error: err.message ?? 'Login failed.' });
  }
});

export default router;
