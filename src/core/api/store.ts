import { storefrontFetch, getStorefrontApiUrl } from "../../utils/storefrontFetch";
import { cache } from "react";

export const getStoreInfo = cache(async (tenantSlug: string, clientIp?: string) => {
  try {
    const res = await storefrontFetch(
      `${getStorefrontApiUrl()}/storefront/${tenantSlug}/info`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}`] } },
      clientIp,
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`[Storefront API Error] info for ${tenantSlug}:`, err);
    return null;
  }
});

export const getTheme = cache(async (tenantSlug: string, clientIp?: string) => {
  try {
    const res = await storefrontFetch(
      `${getStorefrontApiUrl()}/storefront/${tenantSlug}/theme`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}`] } },
      clientIp,
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`[Storefront API Error] theme for ${tenantSlug}:`, err);
    return null;
  }
});

export const getStoreStatus = cache(async (tenantSlug: string, clientIp?: string) => {
  try {
    const res = await storefrontFetch(
      `${getStorefrontApiUrl()}/storefront/${tenantSlug}/status`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}`] } },
      clientIp,
    );
    if (!res.ok) {
      if (res.status === 404) return { storeDown: true, reason: "Store not found" };
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`[Storefront API Error] status for ${tenantSlug}:`, err);
    return null;
  }
});

export const getTrackingConfig = cache(async (tenantSlug: string) => {
  try {
    const res = await storefrontFetch(
      `${getStorefrontApiUrl()}/storefront/${tenantSlug}/tracking`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}`] } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`[Storefront API Error] tracking for ${tenantSlug}:`, err);
    return null;
  }
});
