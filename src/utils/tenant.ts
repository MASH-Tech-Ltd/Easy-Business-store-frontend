import { NextRequest } from 'next/server';

export function getTenantSlugFromReq(req: NextRequest): string {
  const hostname = req.headers.get('host') || '';
  
  let currentHost = hostname;
  // Remove port if exists
  if (currentHost.includes(':')) {
    currentHost = currentHost.split(':')[0];
  }

  let tenantSlug = '';
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost';

  if (currentHost === baseDomain) {
    tenantSlug = 'main';
  } else if (currentHost.endsWith(`.${baseDomain}`)) {
    tenantSlug = currentHost.replace(`.${baseDomain}`, '');
  } else {
    tenantSlug = currentHost;
  }

  return tenantSlug;
}
