/**
 * Optimizes image URLs for lightning-fast mobile loading.
 * Automatically transforms Cloudinary URLs to serve modern WebP/AVIF formats (f_auto),
 * automatic compression (q_auto:good), and resized dimensions (w_500).
 */
export function getOptimizedImageUrl(url?: string | null, width = 500): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Cloudinary image dynamic URL transformation
  if (trimmed.includes('cloudinary.com') && trimmed.includes('/upload/')) {
    // Avoid double transforming if already contains transformation flags
    if (!trimmed.includes('/f_auto') && !trimmed.includes('/q_auto') && !trimmed.includes('/w_')) {
      return trimmed.replace(
        '/upload/',
        `/upload/f_auto,q_auto:good,w_${width},c_limit/`
      );
    }
  }

  return trimmed;
}
