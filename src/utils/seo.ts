import { headers } from 'next/headers';

/**
 * Shared multi-tenant SEO helpers.
 *
 * Every page MUST use these so that Google receives one consistent
 * site name + one canonical origin per tenant (subdomain or custom domain).
 */

type StoreInfoLike = {
  name?: string | null;
  slug?: string | null;
  customDomain?: string | null;
  domainStatus?: string | null;
} | null | undefined;

/** Strip any " - PLATFORM" or " | PLATFORM" suffix that may have been saved in the DB */
export function cleanStoreName(raw: string): string {
  return raw.replace(/\s*[-|]\s*MASH\s*ECO\s*$/i, '').trim();
}

/** The single store name used for <title>, og:site_name and WebSite JSON-LD. */
export function getStoreName(storeInfo: StoreInfoLike, tenantSlug: string): string {
  const raw = storeInfo?.name?.trim() || tenantSlug.toUpperCase();
  return cleanStoreName(raw) || tenantSlug.toUpperCase();
}

/** Read host + tenant slug for the current request (same header the middleware uses). */
export async function getRequestContext() {
  const h = await headers();
  const host = (h.get('host') || h.get('x-forwarded-host') || 'localhost:3000')
    .split(',')[0]
    .trim()
    .toLowerCase();
  const tenantSlug = h.get('x-tenant-slug') || 'main';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return { host, tenantSlug, requestOrigin: `${protocol}://${host}` };
}

/**
 * Canonical origin for a tenant.
 * If the store has a verified (active) custom domain, that domain is the
 * canonical site — so the *.masheco.com subdomain doesn't compete with it
 * as a duplicate site in Google. Otherwise the current host is used.
 */
export function getSiteOrigin(requestOrigin: string, storeInfo: StoreInfoLike): string {
  const custom = storeInfo?.customDomain?.trim().toLowerCase().replace(/^www\./, '');
  if (custom && storeInfo?.domainStatus === 'active' && !requestOrigin.includes('localhost')) {
    return `https://${custom}`;
  }
  return requestOrigin;
}
