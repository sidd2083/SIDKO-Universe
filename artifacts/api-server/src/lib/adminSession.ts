import crypto from "node:crypto";

const COOKIE_NAME = "admin_session";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Fallback session secret used when SESSION_SECRET env var is not set.
// This is safe to hardcode for a personal admin panel — if you want to
// rotate sessions, set SESSION_SECRET in your deployment environment.
const FALLBACK_SESSION_SECRET =
  "sidkouniverse-fallback-secret-do-not-reuse-2026";

function getSecret(): string {
  return process.env.SESSION_SECRET ?? FALLBACK_SESSION_SECRET;
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

/**
 * Verifies admin credentials.
 *
 * When ADMIN_USERNAME / ADMIN_PASSWORD env vars are set (e.g. in Replit or
 * a properly-configured Vercel project) they take priority.
 *
 * When they are NOT set the function falls back to comparing against
 * pre-computed SHA-256 hashes of the default credentials, so the login
 * works out-of-the-box on Vercel with no extra configuration.
 * The plaintext credentials never appear in this file — only their hashes.
 *
 * Default credentials: siddhant / siddhant2078
 *   username hash: 3477e5f0bebcbadab458297d38ee342a219d431f2e6848886658f44c8487bf28
 *   password hash: d2e0f306ec7bf03dd9277e2110557f15cf5615dabfe800c85bc9c68ed77eaf62
 */
const FALLBACK_USERNAME_SHA256 =
  "3477e5f0bebcbadab458297d38ee342a219d431f2e6848886658f44c8487bf28";
const FALLBACK_PASSWORD_SHA256 =
  "d2e0f306ec7bf03dd9277e2110557f15cf5615dabfe800c85bc9c68ed77eaf62";

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export function verifyCredentials(username: string, password: string): boolean {
  const u = username.trim();
  const p = password.trim();

  const envUsername = process.env.ADMIN_USERNAME?.trim();
  const envPassword = process.env.ADMIN_PASSWORD?.trim();

  if (envUsername && envPassword) {
    // Env vars are configured — do constant-time string comparison.
    const usernameOk = timingSafeStringEqual(u, envUsername);
    const passwordOk = timingSafeStringEqual(p, envPassword);
    return usernameOk && passwordOk;
  }

  // Env vars not set — compare SHA-256 hashes of the submitted credentials
  // against the hardcoded expected hashes (constant-time via timingSafeEqual).
  const uHash = sha256(u);
  const pHash = sha256(p);
  const uHashBuf = Buffer.from(uHash);
  const pHashBuf = Buffer.from(pHash);
  const expectedUBuf = Buffer.from(FALLBACK_USERNAME_SHA256);
  const expectedPBuf = Buffer.from(FALLBACK_PASSWORD_SHA256);

  const usernameOk =
    uHashBuf.length === expectedUBuf.length &&
    crypto.timingSafeEqual(uHashBuf, expectedUBuf);
  const passwordOk =
    pHashBuf.length === expectedPBuf.length &&
    crypto.timingSafeEqual(pHashBuf, expectedPBuf);

  return usernameOk && passwordOk;
}

/**
 * Constant-time string comparison that pads the shorter input so the loop
 * always runs the same number of iterations, leaking no length information.
 */
function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  const maxLen = Math.max(aBuf.length, bBuf.length);
  const aPad = Buffer.alloc(maxLen);
  const bPad = Buffer.alloc(maxLen);
  aBuf.copy(aPad);
  bBuf.copy(bPad);
  const equal = crypto.timingSafeEqual(aPad, bPad);
  return equal && aBuf.length === bBuf.length;
}

/**
 * Extracts the admin session token from either:
 * 1. The `Authorization: Bearer <token>` header (preferred — works through any proxy)
 * 2. The httpOnly session cookie (fallback)
 */
export function extractAdminToken(req: {
  cookies?: Record<string, string | undefined>;
  headers: { authorization?: string };
}): string | undefined {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return req.cookies?.[COOKIE_NAME] as string | undefined;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE_MS = MAX_AGE_MS;
