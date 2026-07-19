import { withAdminHeaders } from './adminAuth';
import { apiUrl } from './apiBase';

/**
 * Upload a file to Firebase Storage via the API server.
 * Returns the permanent public Firebase Storage URL.
 */
export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const form = new FormData();
  form.append('file', file);

  // Use XMLHttpRequest so we can report upload progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl('/api/upload'));

    // Attach admin auth headers
    const headers = withAdminHeaders();
    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }

    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { url: string };
          resolve(data.url);
        } catch {
          reject(new Error('Unexpected response from upload server.'));
        }
      } else {
        let msg = `Upload failed (${xhr.status})`;
        try {
          const err = JSON.parse(xhr.responseText) as { error?: string };
          if (err?.error) msg = err.error;
        } catch {}
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload.'));
    xhr.send(form);
  });
}
