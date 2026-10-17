import type { MetadataRoute } from "next";
import { storefrontFetch } from "@/utils/storefrontFetch";
import { getStoreInfo } from "@/core/api/store";
import { getRequestContext, getSiteOrigin } from "@/utils/seo";

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

  // Platform root (no tenant) has no storefront pages.
  if (tenantSlug === "main") return [];

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
