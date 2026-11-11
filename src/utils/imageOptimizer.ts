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
 *   - Product Details Main Image: 800px
 *   - Product Details Gallery: 800px
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
  | 'product-main'    // 800px
  | 'product-gallery' // 800px
  | 'logo'            // 150px
  | 'banner';         // 1200px

export const IMAGE_WIDTHS: Record<ImagePreset, number> = {
  'search': 50,
  'cart': 50,
  'checkout': 50,
  'product-card': 300,
  'category-card': 300,
  'product-main': 800,
  'product-gallery': 800,
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
  url?: any,
  presetOrWidth: ImagePreset | number = 'product-card'
): string {
  if (!url) return '';
  const actualUrl = typeof url === 'string' ? url : url?.secure_url || url?.url || '';
  if (!actualUrl || typeof actualUrl !== 'string') return '';
  const trimmed = actualUrl.trim();
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
export function getFaviconUrl(url?: any, size: number = 192): string {
  if (!url) return '/favicon.ico';
  const actualUrl = typeof url === 'string' ? url : url?.secure_url || url?.url || '';
  if (!actualUrl || typeof actualUrl !== 'string') return '/favicon.ico';
  const trimmed = actualUrl.trim();
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
export function toCdnUrl(url?: any): string {
  if (!url) return '';
  const actualUrl = typeof url === 'string' ? url : url?.secure_url || url?.url || '';
  if (!actualUrl || typeof actualUrl !== 'string') return '';
  const trimmed = actualUrl.trim();
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
export const getProductMainImageUrl = (url?: any) => getOptimizedImageUrl(url, 800);
export const getProductGalleryImageUrl = (url?: any) => getOptimizedImageUrl(url, 800);
export const getStoreLogoUrl = (url?: string | null) => getOptimizedImageUrl(url, 150);
export const getBannerImageUrl = (url?: string | null) => getOptimizedImageUrl(url, 1200);

// ─────────────────────────────────────────────────────────────────────────────
// Progressive Product Image Cache (Card Preview -> High-Quality Main Image)
// Reuses already-loaded 300px card images from Homepage / All Products as an
// instant placeholder on Product Details until the 800px image finishes loading.
// ─────────────────────────────────────────────────────────────────────────────

const loadedPreviewCache = new Map<string, string>();
const loadedHighResSet = new Set<string>();
const SESSION_CACHE_KEY = '__masheco_img_previews__';

export function normalizeImageKey(url?: any): string {
  if (!url) return '';
  const actualUrl = typeof url === 'string' ? url : url?.secure_url || url?.url || '';
  if (!actualUrl || typeof actualUrl !== 'string') return '';
  const trimmed = actualUrl.trim();
  if (!trimmed) return '';

  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/image/upload/')) {
    const parts = trimmed.split('/image/upload/');
    if (parts.length === 2) {
      return stripCloudinaryTransforms(parts[1]);
    }
  }

  if (trimmed.includes('cdn.masheco.com/img/')) {
    const parts = trimmed.split('/img/');
    if (parts.length === 2) {
      return stripCloudinaryTransforms(parts[1]);
    }
  }

  return trimmed;
}

export function rememberLoadedProductImage(rawOrOptimizedUrl?: any, loadedSrc?: string): void {
  if (typeof window === 'undefined') return;
  const key = normalizeImageKey(rawOrOptimizedUrl || loadedSrc);
  const srcToStore = loadedSrc || getProductCardImageUrl(rawOrOptimizedUrl);
  if (!key || !srcToStore) return;

  loadedPreviewCache.set(key, srcToStore);
  try {
    const existingRaw = window.sessionStorage.getItem(SESSION_CACHE_KEY);
    const parsed: Record<string, string> = existingRaw ? JSON.parse(existingRaw) : {};
    parsed[key] = srcToStore;
    // Keep session cache bounded to most recent 100 images
    const keys = Object.keys(parsed);
    if (keys.length > 100) {
      delete parsed[keys[0]];
    }
    window.sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(parsed));
  } catch {}
}

export function getProductPlaceholderImageUrl(url?: any, isPrimary: boolean = true): string {
  if (!url) return '';
  // IMPORTANT: must be deterministic (identical on server & client) to avoid hydration mismatch.
  // The primary image uses the exact same 300px URL as ProductCard, so the browser HTTP/memory
  // cache already holds it; secondary gallery images use the 100px thumbnail URL.
  return isPrimary ? getProductCardImageUrl(url) : getOptimizedImageUrl(url, 100);
}

export function markHighResImageLoaded(url?: any): void {
  const mainUrl = getProductMainImageUrl(url);
  if (mainUrl) {
    loadedHighResSet.add(mainUrl);
  }
}

export function isHighResImageLoaded(url?: any): boolean {
  const mainUrl = getProductMainImageUrl(url);
  return Boolean(mainUrl && loadedHighResSet.has(mainUrl));
}

export function preloadProductMainImage(url?: any): void {
  if (typeof window === 'undefined' || !url) return;
  const mainUrl = getProductMainImageUrl(url);
  if (!mainUrl || loadedHighResSet.has(mainUrl)) return;

  const img = new window.Image();
  img.decoding = 'async';
  img.onload = () => {
    loadedHighResSet.add(mainUrl);
  };
  img.src = mainUrl;
}

