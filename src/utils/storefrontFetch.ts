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

export const DEFAULT_API_URL = 'http://localhost:8000/api/v1';
export const DEFAULT_STOREFRONT_API_KEY = '954073a93e924516a98d0fe2ef0a7ed1600f45a02a72054c16f5629f3715aca9';

export function getStorefrontApiUrl(): string {
  // Use private API_URL first (never exposed to browser).
  // NEXT_PUBLIC_API_URL is kept as a dev fallback but should NOT be set
  // in production — set API_URL instead so the backend domain stays hidden.
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_API_URL
  );
}

export function getStorefrontApiKey(): string {
  return (
    process.env.STOREFRONT_API_KEY ||
    process.env.NEXT_PUBLIC_STOREFRONT_API_KEY ||
    DEFAULT_STOREFRONT_API_KEY
  );
}

export async function storefrontFetch(url: string, init?: RequestInit, clientIp?: string) {
  const apiKey = getStorefrontApiKey();
  const baseApiUrl = getStorefrontApiUrl();

  let resolvedUrl = (url || '').trim();
  if (resolvedUrl.startsWith('undefined')) {
    resolvedUrl = resolvedUrl.replace(/^undefined\/?/, `${baseApiUrl}/`);
  } else if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://')) {
    resolvedUrl = resolvedUrl.replace(/^\/+/, '');
    resolvedUrl = `${baseApiUrl}/${resolvedUrl}`;
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

  // Pass x-tenant-client-ip so backend directClientBlockMiddleware permits the SSR call
  if (ip && ip !== '127.0.0.1' && ip !== '::1') {
    fetchHeaders.set('x-tenant-client-ip', ip);
  } else if (!fetchHeaders.has('x-tenant-client-ip')) {
    fetchHeaders.set('x-tenant-client-ip', '127.0.0.1');
  }

  return fetch(resolvedUrl, {
    ...init,
    headers: fetchHeaders,
  });
}
