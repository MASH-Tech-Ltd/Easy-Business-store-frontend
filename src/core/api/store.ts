import { storefrontFetch } from "../../utils/storefrontFetch";
import { cache } from "react";

export const getStoreInfo = cache(async (tenantSlug: string, clientIp?: string) => {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}`] } },
      clientIp,
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
});

export const getTheme = cache(async (tenantSlug: string, clientIp?: string) => {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}`] } },
      clientIp,
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
});

export const getStoreStatus = cache(async (tenantSlug: string, clientIp?: string) => {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/status`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}`] } },
      clientIp,
    );
    if (!res.ok) {
      if (res.status === 404) return { storeDown: true, reason: "Store not found" };
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
});

export const getTrackingConfig = cache(async (tenantSlug: string) => {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/tracking`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}`] } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
});
