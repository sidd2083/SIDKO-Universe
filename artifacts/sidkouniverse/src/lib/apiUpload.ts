import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';
import { withAdminHeaders } from './adminAuth';

/**
 * Upload a file.
 *
 * Strategy:
 * 1. When Firebase Storage is available (production on Vercel + dev with
 *    VITE_FIREBASE_* set), upload directly from the browser to Firebase
 *    Storage. The resulting URL is a permanent, globally-cached CDN link.
 * 2. Otherwise fall back to the Express /api/upload route (local filesystem,
 *    useful for bare-minimum dev without any Firebase project).
 *
 * @param file       The file to upload.
 * @param onProgress Optional callback with upload percentage 0-100.
 * @returns          A permanent public URL for the uploaded file.
 */
export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (isFirebaseConfigured && storage) {
    return uploadToFirebaseStorage(file, onProgress);
  }
  return uploadToApiServer(file);
}

// ---------------------------------------------------------------------------
// Firebase Storage (permanent, CDN-backed)
// ---------------------------------------------------------------------------
function uploadToFirebaseStorage(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storageRef = ref(storage, filename);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      'state_changed',
      snapshot => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        onProgress?.(pct);
      },
      err => reject(err),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      },
    );
  });
}

// ---------------------------------------------------------------------------
// API server fallback (local filesystem, dev only)
// ---------------------------------------------------------------------------
async function uploadToApiServer(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    credentials: 'include',
    headers: withAdminHeaders(),
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error((err as any).error ?? 'Upload failed');
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}
