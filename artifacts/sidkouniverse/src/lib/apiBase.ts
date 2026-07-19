/**
 * Resolves the API base URL for the current environment.
 *
 * - On Replit (dev): empty string — Vite's dev-server proxy forwards /api → localhost:8080
 * - On Vercel (prod): VITE_API_URL must be set to the deployed API server URL,
 *   e.g. https://sidkouniverse-api.replit.app
 *
 * How to use:
 *   import { apiUrl } from '@/lib/apiBase';
 *   fetch(apiUrl('/api/auth/login'), { ... });
 */

export const API_BASE: string =
  ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/+$/, '');

/**
 * Prepend the API base URL to a path.
 * Pass an absolute path (starting with /) — e.g. apiUrl('/api/auth/login').
 */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
