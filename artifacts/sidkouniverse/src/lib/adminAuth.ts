/**
 * Admin session token helpers.
 *
 * After login the server returns the signed session token in the response body.
 * We store it in sessionStorage and attach it as an Authorization: Bearer header
 * on every admin request. This works reliably on both dev (Vite proxy) and
 * production (Vercel), regardless of cookie behaviour.
 */

const TOKEN_KEY = 'sidko_admin_token';

export function setAdminToken(token: string): void {
  try { sessionStorage.setItem(TOKEN_KEY, token); } catch {}
}

export function getAdminToken(): string | null {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function clearAdminToken(): void {
  try { sessionStorage.removeItem(TOKEN_KEY); } catch {}
}

/** Returns headers object with Authorization set if a token exists. */
export function adminHeaders(): Record<string, string> {
  const token = getAdminToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * Merges adminHeaders() into an existing headers object and returns
 * a new object. Keeps Content-Type etc. you already set.
 */
export function withAdminHeaders(existing: Record<string, string> = {}): Record<string, string> {
  return { ...existing, ...adminHeaders() };
}
