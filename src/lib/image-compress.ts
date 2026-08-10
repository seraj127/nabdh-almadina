/**
 * Compresses an image file to a base64 Data URL with a maximum size constraint.
 * Resizes to fit within maxWidth × maxHeight and reduces quality until under maxBytes.
 * Works in the browser only (uses Canvas API).
 */
export function compressImageToBase64(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0–1 for JPEG
    maxBytes?: number; // Maximum output size in bytes
  } = {}
): Promise<string> {
  const {
    maxWidth = 512,
    maxHeight = 512,
    quality = 0.8,
    maxBytes = 500_000, // 500KB default limit
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        if (h > maxHeight) {
          w = Math.round((w * maxHeight) / h);
          h = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);

        // Try with initial quality, then reduce if too large
        let currentQuality = quality;
        let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);

        // Reduce quality until under maxBytes
        while (dataUrl.length > maxBytes && currentQuality > 0.1) {
          currentQuality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        }

        // If still too large, reduce dimensions further
        if (dataUrl.length > maxBytes) {
          const scale = Math.sqrt(maxBytes / dataUrl.length);
          const newW = Math.round(w * scale);
          const newH = Math.round(h * scale);
          canvas.width = newW;
          canvas.height = newH;
          ctx.drawImage(img, 0, 0, newW, newH);
          dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
