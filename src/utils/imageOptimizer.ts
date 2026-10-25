/**
 * Pass-through helper for image URLs.
 * Dynamic Cloudinary image transformation is removed as images are already
 * compressed and optimized before uploading to the server.
 */
export function getOptimizedImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  return url.trim();
}

