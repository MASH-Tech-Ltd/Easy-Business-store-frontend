import { storefrontFetch } from "../../utils/storefrontFetch";
import { cache } from "react";

export const getProducts = cache(async (tenantSlug: string, searchParams?: string, clientIp?: string) => {
  try {
    const query = searchParams ? `?${searchParams}` : '?limit=50&sort=newest&inStock=true';
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products${query}`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}-products`] } },
      clientIp
    );
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data?.data || json?.data || [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
});

export const getNewArrivalsProducts = cache(async (tenantSlug: string, limit: number = 8, clientIp?: string) => {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products/new-arrivals?limit=${limit}`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}-products`] } },
      clientIp
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.data || json?.data || [];
  } catch {
    return [];
  }
});

export const getBestsellingProducts = cache(async (tenantSlug: string, limit: number = 8, clientIp?: string) => {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products/bestsellers?limit=${limit}`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}-products`] } },
      clientIp
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.data || json?.data || [];
  } catch {
    return [];
  }
});

export const getJustForYouProducts = cache(async (tenantSlug: string, limit: number = 8, clientIp?: string) => {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products/just-for-you?limit=${limit}`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}-products`] } },
      clientIp
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.data || json?.data || [];
  } catch {
    return [];
  }
});

export const getProductBySlug = cache(async (tenantSlug: string, productSlug: string, clientIp?: string) => {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products/${productSlug}`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}-product-${productSlug}`] } },
      clientIp
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
});
