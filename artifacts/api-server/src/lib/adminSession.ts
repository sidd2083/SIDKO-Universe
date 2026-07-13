import crypto from "node:crypto";

const COOKIE_NAME = "admin_session";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be set to use admin sessions.");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** Builds a signed session token: `<expiryMs>.<hmac>` */
export function createSessionToken(): string {
  const expiresAt = Date.now() + MAX_AGE_MS;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expiresAtRaw, signature] = token.split(".");
  if (!expiresAtRaw || !signature) return false;

  const expected = sign(expiresAtRaw);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  return true;
}

export function verifyCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminUsername || !adminPassword) return false;

  const usernameOk = timingSafeStringEqual(username, adminUsername);
  const passwordOk = timingSafeStringEqual(password, adminPassword);
  return usernameOk && passwordOk;
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE_MS = MAX_AGE_MS;
