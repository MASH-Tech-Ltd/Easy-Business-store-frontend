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

  // Parse tenant slug from hostname
  let currentHost = hostname;
  // Remove port if exists
  if (currentHost.includes(':')) {
    currentHost = currentHost.split(':')[0];
  }

  // Strip www. prefix
  if (currentHost.startsWith('www.')) {
    currentHost = currentHost.replace(/^www\./, '');
  }

  let tenantSlug = '';
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const storefrontApiKey = process.env.STOREFRONT_API_KEY || '';

  if (currentHost === baseDomain || currentHost === `www.${baseDomain}`) {
    // It's the main landing page, no tenant
    tenantSlug = 'main';
  } else if (currentHost.endsWith(`.${baseDomain}`)) {
    // It's a subdomain (e.g. mikes.masheco.com -> mikes)
    tenantSlug = currentHost.replace(`.${baseDomain}`, '');
  } else {
    // It's a custom domain (e.g. masheco.tech)
    // We MUST resolve the real tenant slug from the backend, not use the domain in the API URL
    try {
      const infoRes = await fetch(`${apiUrl}/storefront/${currentHost}/info`, {
        headers: { 'x-api-key': storefrontApiKey },
        next: { revalidate: 300 }, // cache for 5 minutes
      });
      if (infoRes.ok) {
        const json = await infoRes.json();
        // Use the real slug from DB — this is the unique identifier for all other API calls
        tenantSlug = json?.data?.slug || currentHost;
      } else {
        tenantSlug = currentHost;
      }
    } catch {
      tenantSlug = currentHost;
    }
  }

  // Ensure it's lowercase
  tenantSlug = tenantSlug.toLowerCase();

  const response = NextResponse.next();
  response.headers.set('x-tenant-slug', tenantSlug);
  return response;
}
