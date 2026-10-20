import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Get hostname (e.g., 'abcstore.myplatform.com' or 'localhost:3000')
  const hostname = request.headers.get('host') || '';
  
  // Exclude static files and API routes from proxy.
  // sitemap.xml / robots.txt are tenant-specific, so they MUST get x-tenant-slug.
  const isTenantSeoFile = url.pathname === '/sitemap.xml' || url.pathname === '/robots.txt';
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    (url.pathname.includes('.') && !isTenantSeoFile)
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
        headers: { 'x-storefront-api-key': storefrontApiKey },
        // Cache for 5 minutes to avoid hitting backend on every request
        next: { revalidate: 300 },
      } as RequestInit);
      if (infoRes.ok) {
        const json = await infoRes.json();
        // Use the real unique slug from DB — all other API calls use this
        tenantSlug = json?.data?.slug || json?.data?.domain || currentHost;
      } else {
        tenantSlug = currentHost;
      }
    } catch {
      tenantSlug = currentHost;
    }
  }

  // Ensure lowercase
  tenantSlug = tenantSlug.toLowerCase();

  // Forward x-tenant-slug and x-tenant-host to Server Components via request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', tenantSlug);
  requestHeaders.set('x-tenant-host', currentHost);

  if (tenantSlug !== 'main') {
    try {
      const statusRes = await fetch(`${apiUrl}/storefront/${tenantSlug}/status`, {
        headers: { 'x-storefront-api-key': storefrontApiKey },
        next: { revalidate: 60 },
      } as RequestInit);
      
      if (!statusRes.ok && statusRes.status === 404) {
        const errorUrl = url.clone();
        errorUrl.pathname = '/404'; // or some other path handled by notFound
        const response = NextResponse.rewrite(errorUrl, {
          request: { headers: requestHeaders },
          status: 404,
        });
        response.headers.set('x-tenant-slug', tenantSlug);
        return response;
      }
      
      if (statusRes.ok) {
        const statusJson = await statusRes.json();

        // 301 Permanent Redirect:
        // If the store has a verified/active custom domain (domainStatus === 'active')
        // and the visitor is accessing via a platform subdomain (e.g. *.masheco.com),
        // permanently redirect them (HTTP 301) to the custom domain, preserving path & search params.
        const customDomainRaw = statusJson?.data?.customDomain;
        const domainStatus = statusJson?.data?.domainStatus;

        if (domainStatus === 'active' && typeof customDomainRaw === 'string') {
          const targetCustomDomain = customDomainRaw
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .split('/')[0];

          const isLocalhost =
            bareHost === 'localhost' ||
            bareHost.endsWith('.localhost') ||
            currentHost.includes('localhost');

          const isSubdomain =
            bareHost.endsWith(`.${baseDomain}`) ||
            bareHost.endsWith('.masheco.com');

          if (
            !isLocalhost &&
            isSubdomain &&
            targetCustomDomain &&
            bareHost !== targetCustomDomain &&
            bareHost !== `www.${targetCustomDomain}`
          ) {
            const redirectUrl = new URL(
              `${url.pathname}${url.search}`,
              `https://${targetCustomDomain}`
            );
            return NextResponse.redirect(redirectUrl, 301);
          }
        }

        if (statusJson?.data?.storeDown) {
          const response = NextResponse.rewrite(url, {
            request: { headers: requestHeaders },
            status: 503,
          });
          response.headers.set('x-tenant-slug', tenantSlug);
          return response;
        }
      }
    } catch {
      // Ignore errors so the site doesn't crash on API failure
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('x-tenant-slug', tenantSlug);
  return response;
}
