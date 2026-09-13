export async function storefrontFetch(url: string, init?: RequestInit) {
  const apiKey = process.env.STOREFRONT_API_KEY;
  
  if (!apiKey) {
    console.error('STOREFRONT_API_KEY is not defined in environment variables');
  }

  const headers = new Headers(init?.headers);
  if (apiKey) {
    headers.set('x-storefront-api-key', apiKey);
  }

  return fetch(url, {
    ...init,
    headers,
  });
}
