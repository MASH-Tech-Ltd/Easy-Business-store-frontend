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
 * Smart Dual-Environment Routing:
 *   - In Production (VPS / Live Stores): Routes 100% through cdn.masheco.com/img/...
 *     so that res.cloudinary.com is never exposed anywhere in the browser.
 *   - In Development (Local Device): Routes directly to Cloudinary so local development
 *     is never blocked by local ISP DNS propagation or local CORS issues.
 */

const IS_DEV = process.env.NODE_ENV === 'development';
const FORCE_CDN = process.env.NEXT_PUBLIC_FORCE_CDN === 'true';
const USE_CDN = !IS_DEV || FORCE_CDN;

/** CDN proxy in prod; direct Cloudinary in dev */
export const CDN_IMG_BASE = USE_CDN
  ? 'https://cdn.masheco.com/img'
  : 'https://res.cloudinary.com/dapjiys4/image/upload';

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

function stripCloudinaryTransforms(rawRest: string): string {
  let rest = rawRest;
  const transformSegmentRegex = /^((?:(?:[a-z]{1,4}_[^,/]+|f_auto|q_auto[^,/]*)[,;]?)+\/)/i;
  while (transformSegmentRegex.test(rest)) {
    rest = rest.replace(transformSegmentRegex, '');
  }
  return rest;
}

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

  // Cloudinary upload URL (http or https, any cloud name)
  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/image/upload/')) {
    const parts = trimmed.split('/image/upload/');
    if (parts.length === 2) {
      const rest = stripCloudinaryTransforms(parts[1]);
      return `${CDN_IMG_BASE}/f_auto,q_auto:good,w_${width},c_limit/${rest}`;
    }
  }

  // Already routed through CDN
  if (trimmed.includes('cdn.masheco.com/img/')) {
    const parts = trimmed.split('/img/');
    if (parts.length === 2) {
      const rest = stripCloudinaryTransforms(parts[1]);
      return `${CDN_IMG_BASE}/f_auto,q_auto:good,w_${width},c_limit/${rest}`;
    }
  }

  return trimmed;
}

/**
 * Generates square PNG favicons for browser tab & search engines
 */
export function getFaviconUrl(url?: string | null, size: number = 192): string {
  if (!url || typeof url !== 'string') return '/favicon.ico';
  const trimmed = url.trim();
  if (!trimmed) return '/favicon.ico';

  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/image/upload/')) {
    const parts = trimmed.split('/image/upload/');
    if (parts.length === 2) {
      let rest = stripCloudinaryTransforms(parts[1]);
      rest = rest.replace(/\.[^/.]+$/, '.png');
      return `${CDN_IMG_BASE}/w_${size},h_${size},c_fill,g_center,f_png/${rest}`;
    }
  }

  if (trimmed.includes('cdn.masheco.com/img/')) {
    const parts = trimmed.split('/img/');
    if (parts.length === 2) {
      let rest = stripCloudinaryTransforms(parts[1]);
      rest = rest.replace(/\.[^/.]+$/, '.png');
      return `${CDN_IMG_BASE}/w_${size},h_${size},c_fill,g_center,f_png/${rest}`;
    }
  }

  return trimmed;
}

/**
 * Generates 180x180 square PNG apple touch icon
 */
export function getAppleTouchIconUrl(url?: string | null): string {
  return getFaviconUrl(url, 180);
}

/**
 * Converts any Cloudinary URL without resizing (preserves original format)
 */
export function toCdnUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/image/upload/')) {
    const parts = trimmed.split('/image/upload/');
    if (parts.length === 2) {
      const rest = stripCloudinaryTransforms(parts[1]);
      return `${CDN_IMG_BASE}/${rest}`;
    }
  }

  return trimmed;
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
