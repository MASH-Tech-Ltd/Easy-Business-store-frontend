import type { MetadataRoute } from "next";
import { storefrontFetch } from "@/utils/storefrontFetch";
import { getStoreInfo } from "@/core/api/store";
import { getRequestContext, getSiteOrigin } from "@/utils/seo";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

async function fetchAllActiveStores() {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.API_URL ||
      'https://backapi.masheco.com/api/v1';
    const res = await fetch(`${apiUrl}/system/active-stores`, {
      next: { revalidate: 3600 },
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1)",
      },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

async function fetchList(tenantSlug: string, path: string) {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/${path}`,
      { next: { revalidate: 3600, tags: [`tenant-${tenantSlug}`] } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

/** Products endpoint is paginated (max 100/page) and returns { data, pagination }. */
async function fetchAllProducts(tenantSlug: string) {
  const all: any[] = [];
  const MAX_PAGES = 50; // up to 5000 products
  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const res = await storefrontFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products?page=${page}&limit=100`,
        { next: { revalidate: 3600, tags: [`tenant-${tenantSlug}`] } },
      );
      if (!res.ok) break;
      const json = await res.json();
      const items = json.data?.data ?? [];
      all.push(...items);
      const totalPages = json.data?.pagination?.totalPages ?? 1;
      if (page >= totalPages || items.length === 0) break;
    } catch {
      break;
    }
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { tenantSlug, requestOrigin } = await getRequestContext();

  // Platform root (no tenant) lists all active merchant store subdomains and custom domains
  if (tenantSlug === "main") {
    const activeStores = await fetchAllActiveStores();
    const baseDomain = (process.env.NEXT_PUBLIC_BASE_DOMAIN || "masheco.com").toLowerCase();

    return activeStores.flatMap((store: any) => {
      const hasActiveCustomDomain =
        store.customDomain &&
        store.domainStatus === "active" &&
        store.customDomain.trim() !== "";

      const cleanCustomDomain = store.customDomain
        ? store.customDomain.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0]
        : "";

      const rawDomain = (store.domain || store.slug || "").toLowerCase().trim();
      if (!rawDomain && !hasActiveCustomDomain) return [];

      const subdomain = rawDomain
        .replace(new RegExp(`\\.${baseDomain}$`), "")
        .replace(/\.masheco\.com$/, "")
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .trim();

      const storeOrigin = hasActiveCustomDomain
        ? `https://${cleanCustomDomain}`
        : `https://${subdomain}.${baseDomain}`;

      const lastMod = store.updatedAt ? new Date(store.updatedAt) : new Date();

      return [
        { url: `${storeOrigin}/`, lastModified: lastMod, changeFrequency: "daily" as const, priority: 1.0 },
        { url: `${storeOrigin}/products`, lastModified: lastMod, changeFrequency: "daily" as const, priority: 0.8 },
        { url: `${storeOrigin}/categories`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.7 },
        { url: `${storeOrigin}/track-order`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.5 },
        { url: `${storeOrigin}/policies/terms`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.4 },
        { url: `${storeOrigin}/policies/privacy`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.4 },
        { url: `${storeOrigin}/policies/refund`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.4 },
      ];
    });
  }

  const storeInfo = await getStoreInfo(tenantSlug);
  if (!storeInfo) return [];

  // Always list URLs on the tenant's canonical origin (custom domain if verified).
  const baseUrl = getSiteOrigin(requestOrigin, storeInfo);

  const [products, categories] = await Promise.all([
    fetchAllProducts(tenantSlug),
    fetchList(tenantSlug, "categories"),
  ]);

  return [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/products`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/categories`, changeFrequency: "weekly", priority: 0.7 },
    ...categories.map((c: any) => ({
      // Route is /category/[slug] (singular)
      url: `${baseUrl}/category/${c.slug || c._id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p: any) => ({
      url: `${baseUrl}/product/${p.slug || p._id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    { url: `${baseUrl}/track-order`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/policies/terms`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${baseUrl}/policies/privacy`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${baseUrl}/policies/refund`, changeFrequency: "monthly" as const, priority: 0.4 },
  ];
}
