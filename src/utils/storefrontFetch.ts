import { headers } from 'next/headers';

/**
 * Resolves the real browser client IP and User-Agent from Next.js incoming request headers.
 * Called automatically by storefrontFetch when running server-side (SSR).
 */
async function resolveClientHeaders(): Promise<{ clientIp?: string; userAgent?: string }> {
  try {
    const headersList = await headers();
    const cfIp = headersList.get('cf-connecting-ip');
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const clientIp = cfIp?.trim() || (forwarded ? forwarded.split(',')[0]?.trim() : null) || realIp?.trim() || undefined;
    const userAgent = headersList.get('user-agent') || undefined;
    return { clientIp, userAgent };
  } catch {
    // headers() throws when called from client components — ignore silently
    return {};
  }
}

export async function storefrontFetch(url: string, init?: RequestInit, clientIp?: string) {
  const apiKey = process.env.STOREFRONT_API_KEY || process.env.NEXT_PUBLIC_STOREFRONT_API_KEY;

  if (!apiKey) {
    console.error('STOREFRONT_API_KEY is not defined in environment variables');
  }

  const fetchHeaders = new Headers(init?.headers);
  if (apiKey) {
    fetchHeaders.set('x-storefront-api-key', apiKey);
  }

  const { clientIp: detectedIp, userAgent } = await resolveClientHeaders();
  const ip = clientIp || detectedIp;

  if (userAgent && !fetchHeaders.has('user-agent')) {
    fetchHeaders.set('user-agent', userAgent);
  }
  if (!fetchHeaders.has('user-agent')) {
    fetchHeaders.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  }

  if (ip && ip !== '127.0.0.1' && ip !== '::1') {
    fetchHeaders.set('x-tenant-client-ip', ip);
  }

  return fetch(url, {
    ...init,
    headers: fetchHeaders,
  });
}
