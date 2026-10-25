import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory cache for middleware (short TTL to keep fast and fresh)
interface CacheItem<T> {
  val: T;
  exp: number;
}
const middlewareSlugCache = new Map<string, CacheItem<string>>();
const middlewareStatusCache = new Map<string, CacheItem<any>>();

function getMiddlewareCached<T>(cache: Map<string, CacheItem<T>>, key: string): T | null {
  const item = cache.get(key);
  if (item && item.exp > Date.now()) return item.val;
  cache.delete(key);
  return null;
}

function setMiddlewareCached<T>(cache: Map<string, CacheItem<T>>, key: string, val: T, ttlMs = 45000): void {
  if (cache.size > 2000) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { val, exp: Date.now() + ttlMs });
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Get hostname (e.g., 'abcstore.myplatform.com' or 'localhost:3000')
  const hostname = request.headers.get('host') || '';
  
  // Exclude static files and API routes from proxy.
  // sitemap.xml is tenant-specific, so it MUST get x-tenant-slug.
  const isTenantSeoFile = url.pathname === '/sitemap.xml';
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    (url.pathname.includes('.') && !isTenantSeoFile && url.pathname !== '/robots.txt')
  ) {
    return NextResponse.next();
  }

  // Remove port if exists
  let currentHost = hostname;
  if (currentHost.includes(':')) {
    currentHost = currentHost.split(':')[0];
  }
  currentHost = currentHost.toLowerCase();

  // Instant zero-latency response for /robots.txt — guaranteed HTTP 200 OK.
  // Never blocks, never times out, never 503s, never redirects, ensuring Google Search Console inspection always succeeds.
  if (url.pathname === '/robots.txt') {
    const proto = request.headers.get('x-forwarded-proto') || (currentHost.includes('localhost') ? 'http' : 'https');
    const robotsTxt = `User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /checkout\nDisallow: /account\nDisallow: /track-order\nDisallow: /api/\n\nSitemap: ${proto}://${currentHost}/sitemap.xml\n`;
    return new NextResponse(robotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  }

  const baseDomain = (process.env.NEXT_PUBLIC_BASE_DOMAIN || 'masheco.com').toLowerCase();
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    'https://backapi.masheco.com/api/v1';
  const storefrontApiKey =
    process.env.STOREFRONT_API_KEY ||
    process.env.NEXT_PUBLIC_STOREFRONT_API_KEY ||
    '954073a93e924516a98d0fe2ef0a7ed1600f45a02a72054c16f5629f3715aca9';

  // Strip www. only for comparison against baseDomain — preserve original for custom domain lookup
  const bareHost = currentHost.replace(/^www\./, '');

  let tenantSlug = '';

  if (bareHost === baseDomain || bareHost === 'localhost') {
    // It's the main landing page, no tenant
    tenantSlug = 'main';
  } else if (bareHost.endsWith(`.${baseDomain}`)) {
    // It's a subdomain (e.g. astha.masheco.com -> astha)
    tenantSlug = bareHost.replace(`.${baseDomain}`, '');
  } else if (bareHost.endsWith('.masheco.com')) {
    // Fallback for masheco.com platform subdomains
    tenantSlug = bareHost.replace('.masheco.com', '');
  } else {
    // It's a custom domain (e.g. www.masheco.tech or masheco.tech).
    const cachedSlug = getMiddlewareCached(middlewareSlugCache, currentHost);
    if (cachedSlug) {
      tenantSlug = cachedSlug;
    } else {
      try {
        const infoRes = await fetch(`${apiUrl}/storefront/${currentHost}/info`, {
          headers: { 'x-storefront-api-key': storefrontApiKey },
        });
        if (infoRes.ok) {
          const json = await infoRes.json();
          tenantSlug = json?.data?.slug || json?.data?.domain || currentHost;
        } else {
          tenantSlug = currentHost;
        }
      } catch {
        tenantSlug = currentHost;
      }
      setMiddlewareCached(middlewareSlugCache, currentHost, tenantSlug, 60000);
    }
  }

  // Ensure lowercase
  tenantSlug = tenantSlug.toLowerCase();

  // Forward x-tenant-slug, x-tenant-host, and x-pathname to Server Components via request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', tenantSlug);
  requestHeaders.set('x-tenant-host', currentHost);
  requestHeaders.set('x-pathname', url.pathname);

  if (tenantSlug !== 'main') {
    try {
      let statusJson = getMiddlewareCached(middlewareStatusCache, tenantSlug);
      let statusOk = Boolean(statusJson);
      let is404 = false;

      if (!statusJson) {
        const statusRes = await fetch(`${apiUrl}/storefront/${tenantSlug}/status`, {
          headers: { 'x-storefront-api-key': storefrontApiKey },
        });
        
        if (!statusRes.ok && statusRes.status === 404) {
          is404 = true;
        } else if (statusRes.ok) {
          statusJson = await statusRes.json();
          statusOk = true;
          setMiddlewareCached(middlewareStatusCache, tenantSlug, statusJson, 45000);
        }
      }
      
      if (is404) {
        const errorUrl = url.clone();
        errorUrl.pathname = '/404'; // or some other path handled by notFound
        const response = NextResponse.rewrite(errorUrl, {
          request: { headers: requestHeaders },
          status: 404,
        });
        response.headers.set('x-tenant-slug', tenantSlug);
        return response;
      }
      
      if (statusOk && statusJson) {

        // 301 Permanent Redirect:
        // If the store has a verified/active custom domain (domainStatus === 'active')
        // and the visitor is accessing via a platform subdomain (e.g. *.masheco.com),
        // permanently redirect them (HTTP 301) to the custom domain, preserving path & search params.
        const customDomainRaw = statusJson?.data?.customDomain;
        const domainStatus = statusJson?.data?.domainStatus;

        if (domainStatus === 'active' && typeof customDomainRaw === 'string') {
          // IMPORTANT: Do NOT strip 'www.' if the custom domain was registered as 'www.domain.com'!
          // Cloudflare SSL certificates are generated specifically for the exact custom hostname registered.
          const targetCustomDomain = customDomainRaw
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .split('/')[0];

          const isLocalhost =
            currentHost.includes('localhost') ||
            bareHost === 'localhost' ||
            bareHost.endsWith('.localhost');

          const isSubdomain =
            bareHost.endsWith(`.${baseDomain}`) ||
            bareHost.endsWith('.masheco.com');

          // Prevent redirect loops: only redirect if visitor is not already on this custom domain
          const isAlreadyOnCustomDomain =
            currentHost === targetCustomDomain ||
            bareHost === targetCustomDomain ||
            currentHost === `www.${targetCustomDomain}` ||
            targetCustomDomain === `www.${bareHost}`;

          if (
            !isLocalhost &&
            isSubdomain &&
            targetCustomDomain &&
            !isAlreadyOnCustomDomain
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
