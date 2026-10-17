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
  domain?: string | null;
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
  const host = (
    h.get('x-tenant-host') ||
    h.get('x-forwarded-host') ||
    h.get('host') ||
    'localhost:3000'
  )
    .split(',')[0]
    .trim()
    .toLowerCase();

  let tenantSlug = h.get('x-tenant-slug') || '';

  // Robust fail-safe: if x-tenant-slug was not passed, extract it directly from the hostname!
  if (!tenantSlug || tenantSlug === 'main') {
    const bareHost = host.replace(/^www\./, '').split(':')[0];
    const baseDomain = (process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost').toLowerCase();

    if (
      bareHost === baseDomain ||
      bareHost === 'localhost' ||
      bareHost === 'masheco.com' ||
      bareHost === 'merchant.masheco.com'
    ) {
      tenantSlug = 'main';
    } else if (bareHost.endsWith(`.${baseDomain}`)) {
      tenantSlug = bareHost.replace(`.${baseDomain}`, '');
    } else if (bareHost.endsWith('.masheco.com')) {
      tenantSlug = bareHost.replace('.masheco.com', '');
    }
  }

  const proto = h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  return { host, tenantSlug: tenantSlug || 'main', requestOrigin: `${proto}://${host}` };
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
