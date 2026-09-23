import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Get hostname (e.g., 'abcstore.myplatform.com' or 'localhost:3000')
  const hostname = request.headers.get('host') || '';
  
  // Exclude static files and API routes from proxy
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Remove port if exists
  let currentHost = hostname;
  if (currentHost.includes(':')) {
    currentHost = currentHost.split(':')[0];
  }

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const storefrontApiKey = process.env.STOREFRONT_API_KEY || '';

  // Strip www. only for comparison against baseDomain — preserve original for custom domain lookup
  const bareHost = currentHost.replace(/^www\./, '');

  let tenantSlug = '';

  if (bareHost === baseDomain) {
    // It's the main landing page, no tenant
    tenantSlug = 'main';
  } else if (bareHost.endsWith(`.${baseDomain}`)) {
    // It's a subdomain (e.g. astha.masheco.com -> astha)
    tenantSlug = bareHost.replace(`.${baseDomain}`, '');
  } else {
    // It's a custom domain (e.g. www.masheco.tech or masheco.tech).
    // Pass the ORIGINAL host (with www if present) to the backend —
    // the backend normalizeTenantQuery checks both 'domain.com' and 'www.domain.com'.
    // The /info endpoint returns the canonical slug, which we use for all subsequent calls.
    try {
      const infoRes = await fetch(`${apiUrl}/storefront/${currentHost}/info`, {
        headers: { 'x-api-key': storefrontApiKey },
        // Cache for 5 minutes to avoid hitting backend on every request
        next: { revalidate: 300 },
      } as RequestInit);
      if (infoRes.ok) {
        const json = await infoRes.json();
        // Use the real unique slug from DB — all other API calls use this
        tenantSlug = json?.data?.slug || currentHost;
      } else {
        tenantSlug = currentHost;
      }
    } catch {
      tenantSlug = currentHost;
    }
  }

  // Ensure lowercase
  tenantSlug = tenantSlug.toLowerCase();

  const response = NextResponse.next();
  response.headers.set('x-tenant-slug', tenantSlug);
  return response;
}
