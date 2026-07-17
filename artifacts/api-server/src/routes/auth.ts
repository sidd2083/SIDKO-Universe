import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { GetAdminSessionResponse } from "@workspace/api-zod";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE_MS,
  createSessionToken,
  extractAdminToken,
  isValidSessionToken,
  verifyCredentials,
} from "../lib/adminSession.js";

const router: IRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

router.post("/auth/login", authLimiter, (req, res): void => {
  const { username, password } = req.body as { username?: unknown; password?: unknown };

  if (!username || typeof username !== "string" || !password || typeof password !== "string") {
    res.status(400).json({ error: "Username and password are required." });
    return;
  }

  if (!verifyCredentials(username, password)) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  const token = createSessionToken();

  // Set httpOnly cookie (works when same-origin or proxy forwards cookies)
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_COOKIE_MAX_AGE_MS,
    path: "/",
  });

  // Also return the token in the body so the client can store it in
  // sessionStorage and send it as an Authorization: Bearer header.
  // This is the reliable path that works regardless of proxy/cookie behavior.
  res.json(GetAdminSessionResponse.parse({ isAdmin: true, token }));
});

router.post("/auth/logout", (_req, res): void => {
  res.clearCookie(ADMIN_COOKIE_NAME, { path: "/" });
  res.sendStatus(204);
});

router.get("/auth/me", (req, res): void => {
  const token = extractAdminToken(req);
  const isAdmin = isValidSessionToken(token);
  res.json(GetAdminSessionResponse.parse({ isAdmin }));
});

export default router;
