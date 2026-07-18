import { withAdminHeaders } from './adminAuth';

/**
 * Upload a file to the best available storage backend.
 *
 * Priority:
 * 1. Cloudinary  — when VITE_CLOUDINARY_CLOUD_NAME + VITE_CLOUDINARY_UPLOAD_PRESET are set.
 *                  Free tier, no credit card, permanent CDN. Works on Vercel + Replit.
 * 2. API server  — fallback to the Express /api/upload route (local filesystem).
 *                  Persistent on Replit, ephemeral on Vercel serverless.
 *
 * @param file       File to upload.
 * @param onProgress Optional progress callback (0–100).
 * @returns          Permanent public URL of the uploaded file.
 */
export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

  if (cloudName && uploadPreset) {
    return uploadToCloudinary(file, cloudName, uploadPreset, onProgress);
  }

  return uploadToApiServer(file);
}

// ---------------------------------------------------------------------------
// Cloudinary unsigned upload (free, permanent CDN, no server code required)
// ---------------------------------------------------------------------------
async function uploadToCloudinary(
  file: File,
  cloudName: string,
  uploadPreset: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', uploadPreset);
    // auto = Cloudinary picks the right resource type (image / video / raw)
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { secure_url: string };
          resolve(data.secure_url);
        } catch {
          reject(new Error('Cloudinary returned an unexpected response.'));
        }
      } else {
        let msg = 'Upload failed.';
        try {
          const err = JSON.parse(xhr.responseText) as { error?: { message?: string } };
          if (err?.error?.message) msg = err.error.message;
        } catch {}
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload.'));
    xhr.send(form);
  });
}

// ---------------------------------------------------------------------------
// Fallback: Express API server upload (local filesystem)
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
