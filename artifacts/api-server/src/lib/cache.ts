/**
 * Tiny in-memory TTL cache for API route data.
 * Eliminates repeat cold Firestore reads within the same TTL window.
 */

interface Entry { data: unknown; expires: number }
const store = new Map<string, Entry>();

/** Return cached value if fresh, otherwise call fetcher, cache result, return it. */
export async function cached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const entry = store.get(key);
  if (entry && entry.expires > Date.now()) return entry.data as T;
  const data = await fetcher();
  store.set(key, { data, expires: Date.now() + ttlMs });
  return data;
}

/** Bust the cache for a specific key (call on write operations). */
export function invalidate(key: string): void {
  store.delete(key);
}
