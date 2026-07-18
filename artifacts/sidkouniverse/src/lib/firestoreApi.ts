/**
 * Admin write helpers that go through the API server instead of writing to
 * Firestore directly from the browser. Firestore's own security rules deny
 * all client writes — only the server (using the Firebase Admin SDK, gated
 * by the admin session) can create/update/delete documents.
 *
 * Reads still go straight to Firestore from the client (see useFirestore),
 * since Firestore rules allow public reads.
 */

import { withAdminHeaders } from './adminAuth';

/** Sentinel that the server replaces with a real Firestore server timestamp. */
export const SERVER_TIMESTAMP = '__serverTimestamp__';

async function request(path: string, options: RequestInit) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: withAdminHeaders({ 'Content-Type': 'application/json' }),
    ...options,
    // Merge headers so admin token + Content-Type are both sent
    ...(options.headers
      ? { headers: withAdminHeaders({ 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) }) }
      : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((err as any).error ?? 'Request failed');
  }
  return res.json();
}

export async function addFirestoreDoc(
  collectionName: string,
  data: Record<string, unknown>,
): Promise<{ id: string }> {
  return request(`/api/firestore/${collectionName}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFirestoreDoc(
  collectionName: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await request(`/api/firestore/${collectionName}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteFirestoreDoc(collectionName: string, id: string): Promise<void> {
  await request(`/api/firestore/${collectionName}/${id}`, {
    method: 'DELETE',
  });
}
