export async function storefrontFetch(url: string, init?: RequestInit, clientIp?: string) {
  const apiKey = process.env.STOREFRONT_API_KEY;
  
  if (!apiKey) {
    console.error('STOREFRONT_API_KEY is not defined in environment variables');
  }

  const headers = new Headers(init?.headers);
  if (apiKey) {
    headers.set('x-storefront-api-key', apiKey);
  }

  // Forward the real visitor IP to the backend so it appears in logs
  // and is used by security/analytics middleware instead of the Next.js server IP.
  if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') {
    headers.set('x-forwarded-for', clientIp);
    headers.set('x-real-ip', clientIp);
  }

  return fetch(url, {
    ...init,
    headers,
  });
}

