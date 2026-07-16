import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { GetAdminSessionResponse } from "@workspace/api-zod";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE_MS,
  createSessionToken,
  isValidSessionToken,
} from "../lib/adminSession.js";
import { getAdminAuth } from "../lib/firebaseAdmin.js";

const router: IRouter = Router();

// Strict rate limit on all auth endpoints: 10 attempts per 15 minutes per IP.
// Prevents brute-force and token-stuffing attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

/**
 * POST /auth/google
 *
 * Verifies a Firebase ID token obtained from Google Sign-In on the client.
 * Only the email matching ADMIN_EMAIL env var is granted admin access.
 * On success, issues the existing HMAC-signed session cookie.
 *
 * No credentials (username/password) are ever sent over the wire.
 */
router.post("/auth/google", authLimiter, async (req, res): Promise<void> => {
  const { idToken } = req.body as { idToken?: unknown };

  if (!idToken || typeof idToken !== "string") {
    res.status(400).json({ error: "idToken is required." });
    return;
  }

  const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!allowedEmail) {
    req.log.error("ADMIN_EMAIL env var is not set");
    res.status(503).json({ error: "Admin login is not configured on this server." });
    return;
  }

  // Verify the token signature and expiry with Firebase Admin
  let tokenEmail: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken, true);
    if (!decoded.email) {
      res.status(401).json({ error: "Google account has no email." });
      return;
    }
    tokenEmail = decoded.email.toLowerCase();
  } catch (err) {
    req.log.warn({ err }, "Google ID token verification failed");
    res.status(401).json({ error: "Invalid or expired Google token." });
    return;
  }

  // Whitelist check — only the configured Gmail is allowed in
  if (tokenEmail !== allowedEmail) {
    req.log.warn({ tokenEmail }, "Google login rejected: email not on allowlist");
    res.status(403).json({ error: "Access denied." });
    return;
  }

  const token = createSessionToken();
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_COOKIE_MAX_AGE_MS,
    path: "/",
  });

  res.json(GetAdminSessionResponse.parse({ isAdmin: true }));
});

router.post("/auth/logout", (_req, res): void => {
  res.clearCookie(ADMIN_COOKIE_NAME, { path: "/" });
  res.sendStatus(204);
});

router.get("/auth/me", (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  const isAdmin = isValidSessionToken(token);
  res.json(GetAdminSessionResponse.parse({ isAdmin }));
});

export default router;
