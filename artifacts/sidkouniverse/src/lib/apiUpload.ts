import { withAdminHeaders } from './adminAuth';

/**
 * Upload a file to the API server.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    credentials: 'include',
    headers: withAdminHeaders(), // send Bearer token if available
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error((err as any).error ?? 'Upload failed');
  }

  const data = await res.json() as { url: string };
  return data.url;
}
