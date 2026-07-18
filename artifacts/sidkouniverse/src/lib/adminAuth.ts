/**
 * Admin session token helpers.
 *
 * After login the server returns the signed session token in the response body.
 * We store it in localStorage (NOT sessionStorage) so it survives tab closes,
 * page refreshes, and browser restarts. It is attached as an Authorization:
 * Bearer header on every admin request, bypassing cookie / proxy issues.
 *
 * We also register it as the auth-token getter for the generated API client
 * (customFetch) so that useGetAdminSession / /api/auth/me also sees it.
 */

import { setAuthTokenGetter } from '@workspace/api-client-react';

const TOKEN_KEY = 'sidko_admin_token';

export function setAdminToken(token: string): void {
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
}

export function getAdminToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function clearAdminToken(): void {
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
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

// Register the token getter with the generated API client so that
// useGetAdminSession (and any other generated hooks) automatically attach
// the Bearer token — making server-side /auth/me checks reliable after reload.
setAuthTokenGetter(() => getAdminToken());
