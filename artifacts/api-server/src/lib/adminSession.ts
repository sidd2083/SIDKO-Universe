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
  const adminUsername = process.env.ADMIN_USERNAME?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!adminUsername || !adminPassword) return false;

  // Trim the incoming credentials too — prevents trivial failures from
  // copy-paste whitespace while still doing a constant-time comparison.
  const usernameOk = timingSafeStringEqual(username.trim(), adminUsername);
  const passwordOk = timingSafeStringEqual(password.trim(), adminPassword);
  return usernameOk && passwordOk;
}

/**
 * Constant-time string comparison that pads the shorter input so the loop
 * always runs the same number of iterations, leaking no length information.
 */
function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  // Pad to the same length so timingSafeEqual can run; XOR the length
  // difference into the result bit so mismatched lengths still fail.
  const maxLen = Math.max(aBuf.length, bBuf.length);
  const aPad = Buffer.alloc(maxLen);
  const bPad = Buffer.alloc(maxLen);
  aBuf.copy(aPad);
  bBuf.copy(bPad);
  const equal = crypto.timingSafeEqual(aPad, bPad);
  return equal && aBuf.length === bBuf.length;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE_MS = MAX_AGE_MS;
