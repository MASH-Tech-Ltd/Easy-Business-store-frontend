export async function storefrontFetch(url: string, init?: RequestInit, clientIp?: string) {
  const apiKey = process.env.STOREFRONT_API_KEY;

  if (!apiKey) {
    console.error('STOREFRONT_API_KEY is not defined in environment variables');
  }

  const headers = new Headers(init?.headers);
  if (apiKey) {
    headers.set('x-storefront-api-key', apiKey);
  }

  // Forward the real visitor IP using a CUSTOM header that Cloudflare does NOT overwrite.
  //
  // WHY NOT x-forwarded-for or x-real-ip?
  //   Traffic path: Browser → Cloudflare → Next.js → Cloudflare → Backend
  //   On the second hop (Next.js → CF → Backend), Cloudflare sets cf-connecting-ip = Next.js IP
  //   and may rewrite x-forwarded-for as well. Standard headers arrive wrong.
  //
  // WHY x-tenant-client-ip IS SAFE:
  //   Cloudflare does not recognize this custom header and passes it through unmodified.
  //   It is only trusted by ipHelper.ts on storefront API routes which already require
  //   x-storefront-api-key — so untrusted external callers cannot spoof this header.
  if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') {
    headers.set('x-tenant-client-ip', clientIp);
  }

  return fetch(url, {
    ...init,
    headers,
  });
}
