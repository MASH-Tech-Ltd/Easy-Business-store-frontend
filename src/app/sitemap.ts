import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { storefrontFetch } from "@/utils/storefrontFetch";

async function fetchList(tenantSlug: string, path: string) {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/${path}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const tenantSlug = h.get("x-tenant-slug") || "main";

  const [products, categories] = await Promise.all([
    fetchList(tenantSlug, "products"),
    fetchList(tenantSlug, "categories"),
  ]);

  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/products`, changeFrequency: "daily", priority: 0.8 },
    ...categories.map((c: any) => ({
      url: `${baseUrl}/categories/${c.slug || c._id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p: any) => ({
      url: `${baseUrl}/product/${p.slug || p._id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
