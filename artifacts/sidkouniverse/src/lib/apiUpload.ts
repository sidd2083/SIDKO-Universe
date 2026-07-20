/**
 * uploadFile — universal image upload that works on Replit AND Vercel.
 *
 * Strategy: compress the image entirely in the browser using Canvas,
 * convert to a JPEG base64 data URL, and return it directly.
 * No server round-trip, no cloud storage billing, no filesystem dependency.
 * The data URL is stored straight in Firestore as the image value.
 *
 * Typical output sizes after compression:
 *   - Phone photo (12MP)  → ~150–250 KB data URL
 *   - Screenshot          → ~80–150 KB data URL
 * Well within Firestore's 1 MB document limit for a personal site.
 */
export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error(
      'Only image files can be uploaded here. For audio, paste a direct URL instead.',
    );
  }
  return compressToDataUrl(file, onProgress);
}

/** Resize + JPEG-compress an image file and return a base64 data URL. */
function compressToDataUrl(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    onProgress?.(10);

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.onload = (ev) => {
      onProgress?.(30);
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image.'));
      img.onload = () => {
        onProgress?.(60);

        const MAX = 1400; // px — keeps quality while capping size
        let { width, height } = img;

        if (width > MAX || height > MAX) {
          if (width >= height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas unavailable.'));
        ctx.drawImage(img, 0, 0, width, height);

        onProgress?.(90);

        // JPEG at 0.82 quality — good visual fidelity, small file
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        onProgress?.(100);
        resolve(dataUrl);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
