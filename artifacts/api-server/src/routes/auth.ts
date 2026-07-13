import { Router, type IRouter } from "express";
import { LoginAdminBody, GetAdminSessionResponse } from "@workspace/api-zod";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE_MS,
  createSessionToken,
  isValidSessionToken,
  verifyCredentials,
} from "../lib/adminSession";

const router: IRouter = Router();

router.post("/auth/login", (req, res): void => {
  const parsed = LoginAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    req.log.error("ADMIN_USERNAME/ADMIN_PASSWORD are not configured");
    res.status(401).json({ error: "Admin login is not configured." });
    return;
  }

  if (!verifyCredentials(username, password)) {
    res.status(401).json({ error: "Invalid username or password." });
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

router.post("/auth/logout", (req, res): void => {
  res.clearCookie(ADMIN_COOKIE_NAME, { path: "/" });
  res.sendStatus(204);
});

router.get("/auth/me", (req, res): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  const isAdmin = isValidSessionToken(token);
  res.json(GetAdminSessionResponse.parse({ isAdmin }));
});

export default router;
