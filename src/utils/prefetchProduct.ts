'use client';

// In-memory set of already prefetched product slugs to prevent duplicate network calls
const prefetchedProducts = new Set<string>();

/**
 * Silently prefetches a product in the background on hover.
 * 1. Sends a silent low-priority GET request through the BFF proxy so the backend warms up the product query.
 * 2. Deduplicates requests so multiple mouse-enters on the same card don't spam the network.
 */
export function prefetchProduct(productSlug: string, fallbackTenant?: string) {
  if (!productSlug || typeof window === 'undefined') return;

  const key = `${fallbackTenant || ''}:${productSlug}`;
  if (prefetchedProducts.has(key)) return;
  prefetchedProducts.add(key);

  let tenantSlug = fallbackTenant;
  const host = window.location.hostname.toLowerCase();
  const baseDomain = (process.env.NEXT_PUBLIC_BASE_DOMAIN || 'masheco.com').toLowerCase();
  const bareHost = host.replace(/^www\./, '');

  if (bareHost === baseDomain || bareHost === 'localhost' || bareHost === '127.0.0.1') {
    tenantSlug = fallbackTenant || 'main';
  } else if (bareHost.endsWith(`.${baseDomain}`)) {
    tenantSlug = bareHost.replace(`.${baseDomain}`, '');
  } else if (bareHost.endsWith('.masheco.com')) {
    tenantSlug = bareHost.replace('.masheco.com', '');
  } else if (host && host !== 'localhost') {
    // Custom domain (e.g. www.masheco.tech)
    tenantSlug = host;
  }

  const finalTenant = tenantSlug || 'main';

  try {
    fetch(`/api/storefront/${encodeURIComponent(finalTenant)}/products/${encodeURIComponent(productSlug)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      // @ts-ignore - low priority prevents blocking critical rendering
      priority: 'low',
    }).catch(() => {});
  } catch {}
}
