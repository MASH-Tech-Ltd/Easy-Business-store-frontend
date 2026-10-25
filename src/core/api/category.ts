import { storefrontFetch } from "../../utils/storefrontFetch";
import { cache } from "react";

export const getCategories = cache(async (tenantSlug: string, clientIp?: string) => {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}-categories`] } },
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
