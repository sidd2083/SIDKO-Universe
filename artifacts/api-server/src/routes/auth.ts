import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { GetAdminSessionResponse } from "@workspace/api-zod";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE_MS,
  createSessionToken,
  isValidSessionToken,
  verifyCredentials,
} from "../lib/adminSession.js";

const router: IRouter = Router();

// Strict rate limit on all auth endpoints: 10 attempts per 15 minutes per IP.
// Prevents brute-force attacks on the login form.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

/**
 * POST /auth/login
 *
 * Verifies admin username + password against the ADMIN_USERNAME / ADMIN_PASSWORD
 * environment secrets using constant-time comparison (no timing side-channel).
 * On success, issues an HMAC-signed httpOnly session cookie — credentials are
 * never stored client-side and never appear in DevTools after this response.
 */
router.post("/auth/login", authLimiter, (req, res): void => {
  const { username, password } = req.body as { username?: unknown; password?: unknown };

  if (!username || typeof username !== "string" || !password || typeof password !== "string") {
    res.status(400).json({ error: "Username and password are required." });
    return;
  }

  if (!verifyCredentials(username, password)) {
    // Always return 401 — never hint which field was wrong.
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  const token = createSessionToken();
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,       // not readable by JS — invisible in DevTools Application → JS context
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
