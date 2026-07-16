import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { GetAdminSessionResponse } from "@workspace/api-zod";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE_MS,
  createSessionToken,
  isValidSessionToken,
} from "../lib/adminSession.js";

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

  // Verify the ID token using Google's public tokeninfo endpoint.
  // This requires zero credentials — Google validates the signature server-side.
  let tokenEmail: string;
  try {
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );
    if (!verifyRes.ok) {
      req.log.warn({ status: verifyRes.status }, "Google tokeninfo rejected token");
      res.status(401).json({ error: "Invalid or expired Google token." });
      return;
    }
    const claims = (await verifyRes.json()) as Record<string, string>;

    // Basic audience check — must be our Firebase project
    const expectedProjectId = process.env.FIREBASE_PROJECT_ID;
    if (expectedProjectId && claims.aud !== expectedProjectId) {
      // Firebase ID tokens use the project ID as the audience
      // (web app client tokens use the numeric app ID — accept both)
      const appId = process.env.VITE_FIREBASE_APP_ID ?? "";
      if (claims.aud !== appId) {
        req.log.warn({ aud: claims.aud }, "Token audience mismatch");
        res.status(401).json({ error: "Token is not for this project." });
        return;
      }
    }

    if (!claims.email) {
      res.status(401).json({ error: "Google account has no email." });
      return;
    }
    if (claims.email_verified !== "true") {
      res.status(401).json({ error: "Google email is not verified." });
      return;
    }
    tokenEmail = claims.email.toLowerCase();
  } catch (err) {
    req.log.error({ err }, "Failed to contact Google tokeninfo endpoint");
    res.status(500).json({ error: "Could not verify token. Try again." });
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
