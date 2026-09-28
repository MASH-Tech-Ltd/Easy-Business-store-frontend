import { headers } from 'next/headers';

/**
 * Resolves the real browser client IP from Next.js incoming request headers.
 * Called automatically by storefrontFetch when running server-side (SSR).
 *
 * Priority: cf-connecting-ip > x-forwarded-for (first entry) > x-real-ip
 */
async function resolveClientIp(): Promise<string | undefined> {
  try {
    const headersList = await headers();
    const cfIp = headersList.get('cf-connecting-ip');
    if (cfIp) return cfIp.trim();

    const forwarded = headersList.get('x-forwarded-for');
    if (forwarded) {
      const first = forwarded.split(',')[0]?.trim();
      if (first && first !== '127.0.0.1' && first !== '::1') return first;
    }

    const realIp = headersList.get('x-real-ip');
    if (realIp) return realIp.trim();
  } catch {
    // headers() throws when called from client components — ignore silently
  }
  return undefined;
}

export async function storefrontFetch(url: string, init?: RequestInit, clientIp?: string) {
  const apiKey = process.env.STOREFRONT_API_KEY;

  if (!apiKey) {
    console.error('STOREFRONT_API_KEY is not defined in environment variables');
  }

  const fetchHeaders = new Headers(init?.headers);
  if (apiKey) {
    fetchHeaders.set('x-storefront-api-key', apiKey);
  }

  // Resolve the real visitor IP: use explicit parameter if provided, otherwise auto-detect from headers.
  // This ensures ALL server-side calls (layout, pages, themes) forward the real IP
  // without requiring every caller to manually extract and pass it.
  const ip = clientIp || (await resolveClientIp());

  // Forward using x-tenant-client-ip — a custom header that Cloudflare does NOT overwrite.
  //
  // WHY NOT x-forwarded-for or cf-connecting-ip?
  //   Traffic: Browser → CF → Next.js → CF → Backend
  //   On the second hop (Next.js → CF → Backend), Cloudflare replaces cf-connecting-ip
  //   with the Next.js server IP and may also modify x-forwarded-for.
  //   x-tenant-client-ip is a custom non-standard header that CF passes through unmodified.
  //
  // SECURITY: Only trusted by backend on storefront routes protected by x-storefront-api-key.
  if (ip && ip !== '127.0.0.1' && ip !== '::1') {
    fetchHeaders.set('x-tenant-client-ip', ip);
  }

  return fetch(url, {
    ...init,
    headers: fetchHeaders,
  });
}
