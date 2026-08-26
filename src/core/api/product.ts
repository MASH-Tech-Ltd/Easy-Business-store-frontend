export async function getProducts(tenantSlug: string, searchParams?: string) {
  try {
    const query = searchParams ? `?${searchParams}` : '?limit=50&sort=random';
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products${query}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data?.data || json?.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function getBestsellingProducts(tenantSlug: string, limit: number = 8) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products/bestsellers?limit=${limit}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.data || json?.data || [];
  } catch (error) {
    return [];
  }
}

export async function getJustForYouProducts(tenantSlug: string, limit: number = 8) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products/just-for-you?limit=${limit}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.data || json?.data || [];
  } catch (error) {
    return [];
  }
}

export async function getProductBySlug(tenantSlug: string, productSlug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products/${productSlug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}
