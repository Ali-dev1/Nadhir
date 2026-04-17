/**
 * Client-side image optimization for Nadhir Admin Portal.
 * Uses native HTML5 Canvas — zero external dependencies.
 *
 * Constraints:
 *   Max width:  1200px
 *   Max height: 1600px
 *   Max size:   300KB (0.3MB)
 *   Format:     WebP (JPEG fallback for Safari < 16)
 */

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxSizeBytes?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: Required<OptimizeOptions> = {
  maxWidth: 1200,
  maxHeight: 1600,
  maxSizeBytes: 300 * 1024, // 300KB
  quality: 0.82,
};

/**
 * Loads a File into an HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Draws the image onto a canvas at the target dimensions and
 * exports it as a Blob, iteratively reducing quality until
 * the file size is under the limit.
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null'));
      },
      mimeType,
      quality
    );
  });
}

/**
 * Detects WebP support (cached result).
 */
let _supportsWebP: boolean | null = null;
function supportsWebP(): boolean {
  if (_supportsWebP !== null) return _supportsWebP;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  _supportsWebP = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  return _supportsWebP;
}

/**
 * Optimizes a single image file:
 *  1. Resizes to fit within maxWidth × maxHeight (maintaining aspect ratio)
 *  2. Compresses to WebP (or JPEG fallback)
 *  3. Iteratively reduces quality until filesize < maxSizeBytes
 *
 * Returns a new File object ready for upload.
 */
export async function optimizeImage(
  file: File,
  options?: OptimizeOptions
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Skip if already small enough and is a web format
  const isWebFormat = file.type === 'image/webp' || file.type === 'image/jpeg';
  if (file.size <= opts.maxSizeBytes && isWebFormat) {
    // Still need to check dimensions
    const img = await loadImage(file);
    if (img.naturalWidth <= opts.maxWidth && img.naturalHeight <= opts.maxHeight) {
      return file; // Already optimal
    }
  }

  const img = await loadImage(file);

  // Calculate target dimensions (maintain aspect ratio)
  let { naturalWidth: w, naturalHeight: h } = img;

  if (w > opts.maxWidth) {
    h = Math.round(h * (opts.maxWidth / w));
    w = opts.maxWidth;
  }
  if (h > opts.maxHeight) {
    w = Math.round(w * (opts.maxHeight / h));
    h = opts.maxHeight;
  }

  // Draw to canvas
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Use high-quality downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);

  // Determine output format
  const useWebP = supportsWebP();
  const mimeType = useWebP ? 'image/webp' : 'image/jpeg';
  const ext = useWebP ? 'webp' : 'jpg';

  // Iteratively compress until under size limit
  let quality = opts.quality;
  let blob: Blob;
  let attempts = 0;
  const MAX_ATTEMPTS = 6;

  do {
    blob = await canvasToBlob(canvas, mimeType, quality);
    if (blob.size <= opts.maxSizeBytes) break;
    quality -= 0.1;
    attempts++;
  } while (quality > 0.3 && attempts < MAX_ATTEMPTS);

  // Build a clean filename
  const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const optimizedFile = new File([blob], `${baseName}.${ext}`, { type: mimeType });

  return optimizedFile;
}

/**
 * Batch-optimizes multiple files.
 */
export async function optimizeImages(
  files: File[],
  options?: OptimizeOptions
): Promise<File[]> {
  return Promise.all(files.map((f) => optimizeImage(f, options)));
}
