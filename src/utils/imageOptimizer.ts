/**
 * MASH ECO – Global Cloudinary Image Optimization Policy
 *
 * Cloudinary Transformation Format:
 *   f_auto,q_auto:good,w_WIDTH,c_limit
 *
 * Module / Page Standard Widths:
 *   - Search Results: 50px
 *   - Cart: 50px
 *   - Checkout: 50px
 *   - Homepage Products & Category Listing: 300px
 *   - Product Details Main Image: 500px
 *   - Product Details Gallery: 600px
 *   - Store Logo: 150px
 *   - Homepage Banner: 1200px
 *
 * CDN Proxy:
 *   All Cloudinary URLs are rewritten to go through cdn.masheco.com
 *   so that res.cloudinary.com is never exposed in the browser.
 */

/** CDN proxy — maps /img/... → Cloudinary /dapjiys4/image/upload/... */
const CDN_IMG_BASE = 'https://cdn.masheco.com/img';
const CLOUDINARY_UPLOAD_PREFIX = 'https://res.cloudinary.com/dapjiys4/image/upload/';

export type ImagePreset =
  | 'search'          // 50px
  | 'cart'            // 50px
  | 'checkout'        // 50px
  | 'product-card'    // 300px
  | 'category-card'   // 300px
  | 'product-main'    // 500px
  | 'product-gallery' // 600px
  | 'logo'            // 150px
  | 'banner';         // 1200px

export const IMAGE_WIDTHS: Record<ImagePreset, number> = {
  'search': 50,
  'cart': 50,
  'checkout': 50,
  'product-card': 300,
  'category-card': 300,
  'product-main': 500,
  'product-gallery': 600,
  'logo': 150,
  'banner': 1200,
};

export function getOptimizedImageUrl(
  url?: string | null,
  presetOrWidth: ImagePreset | number = 'product-card'
): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const width =
    typeof presetOrWidth === 'number'
      ? presetOrWidth
      : IMAGE_WIDTHS[presetOrWidth] || 300;

  // Non-Cloudinary or already optimized internal assets
  if (!trimmed.includes('res.cloudinary.com') || !trimmed.includes('/image/upload/')) {
    return trimmed;
  }

  const parts = trimmed.split('/image/upload/');
  if (parts.length !== 2) return trimmed;

  // baseUrl = https://res.cloudinary.com/dapjiys4/image/upload/
  const baseUrl = parts[0] + '/image/upload/';
  let rest = parts[1];

  // Remove any existing transformation segments (prevents double transformation)
  const transformSegmentRegex = /^((?:(?:[a-z]{1,4}_[^,/]+|f_auto|q_auto[^,/]*)[,;]?)+\/)/i;
  while (transformSegmentRegex.test(rest)) {
    rest = rest.replace(transformSegmentRegex, '');
  }

  // Build the Cloudinary optimized URL then rewrite to CDN:
  // https://res.cloudinary.com/dapjiys4/image/upload/TRANSFORMS/photo.jpg
  //   → https://cdn.masheco.com/img/TRANSFORMS/photo.jpg
  const fullCloudinaryUrl = `${baseUrl}f_auto,q_auto:good,w_${width},c_limit/${rest}`;
  return fullCloudinaryUrl.replace(CLOUDINARY_UPLOAD_PREFIX, `${CDN_IMG_BASE}/`);
}

// Semantic helper functions matching the Global Optimization Standard
export const getSearchThumbnailUrl = (url?: string | null) => getOptimizedImageUrl(url, 50);
export const getCartThumbnailUrl = (url?: string | null) => getOptimizedImageUrl(url, 50);
export const getCheckoutThumbnailUrl = (url?: string | null) => getOptimizedImageUrl(url, 50);
export const getProductCardImageUrl = (url?: string | null) => getOptimizedImageUrl(url, 300);
export const getCategoryCardImageUrl = (url?: string | null) => getOptimizedImageUrl(url, 300);
export const getProductMainImageUrl = (url?: string | null) => getOptimizedImageUrl(url, 500);
export const getProductGalleryImageUrl = (url?: string | null) => getOptimizedImageUrl(url, 600);
export const getStoreLogoUrl = (url?: string | null) => getOptimizedImageUrl(url, 150);
export const getBannerImageUrl = (url?: string | null) => getOptimizedImageUrl(url, 1200);
