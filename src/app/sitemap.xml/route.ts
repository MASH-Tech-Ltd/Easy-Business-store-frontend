import { NextResponse } from "next/server";
import { storefrontFetch } from "@/utils/storefrontFetch";
import { getStoreInfo } from "@/core/api/store";
import { getRequestContext, getSiteOrigin } from "@/utils/seo";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

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

export async function GET() {
  const { tenantSlug, requestOrigin } = await getRequestContext();
  const baseDomain = (process.env.NEXT_PUBLIC_BASE_DOMAIN || "masheco.com").toLowerCase();

  // 1. GLOBAL SITEMAP INDEX: When requested on the main platform domain (e.g. masheco.com)
  // Google Search Console will read this single file and automatically discover all stores!
  if (tenantSlug === "main") {
    const activeStores = await fetchAllActiveStores();
    const nowIso = new Date().toISOString();

    const sitemapEntries: string[] = [
      `  <sitemap>\n    <loc>${escapeXml(`${requestOrigin}/sitemap-main.xml`)}</loc>\n    <lastmod>${nowIso}</lastmod>\n  </sitemap>`,
    ];

    for (const store of activeStores) {
      const hasActiveCustomDomain =
        store.customDomain &&
        store.domainStatus === "active" &&
        store.customDomain.trim() !== "";

      const cleanCustomDomain = store.customDomain
        ? store.customDomain.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0]
        : "";

      const rawDomain = (store.domain || store.slug || "").toLowerCase().trim();
      if (!rawDomain && !hasActiveCustomDomain) continue;

      const subdomain = rawDomain
        .replace(new RegExp(`\\.${baseDomain}$`), "")
        .replace(/\.masheco\.com$/, "")
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .trim();

      const storeOrigin = hasActiveCustomDomain
        ? `https://${cleanCustomDomain}`
        : `https://${subdomain}.${baseDomain}`;

      const lastmod = store.updatedAt ? new Date(store.updatedAt).toISOString() : nowIso;

      sitemapEntries.push(
        `  <sitemap>\n    <loc>${escapeXml(`${storeOrigin}/sitemap.xml`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join("\n")}\n</sitemapindex>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  }

  // 2. TENANT STORE URLSET: When requested on a tenant subdomain or custom domain
  const storeInfo = await getStoreInfo(tenantSlug);
  if (!storeInfo) {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 200,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }

  const baseUrl = getSiteOrigin(requestOrigin, storeInfo);
  const [products, categories] = await Promise.all([
    fetchAllProducts(tenantSlug),
    fetchList(tenantSlug, "categories"),
  ]);

  const lastModIso = (storeInfo.updatedAt ? new Date(storeInfo.updatedAt) : new Date()).toISOString();

  const urlEntries: string[] = [
    `  <url>\n    <loc>${escapeXml(`${baseUrl}/`)}</loc>\n    <lastmod>${lastModIso}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    `  <url>\n    <loc>${escapeXml(`${baseUrl}/products`)}</loc>\n    <lastmod>${lastModIso}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    `  <url>\n    <loc>${escapeXml(`${baseUrl}/categories`)}</loc>\n    <lastmod>${lastModIso}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
  ];

  for (const c of categories) {
    const cMod = (c.updatedAt ? new Date(c.updatedAt) : new Date()).toISOString();
    urlEntries.push(
      `  <url>\n    <loc>${escapeXml(`${baseUrl}/category/${c.slug || c._id}`)}</loc>\n    <lastmod>${cMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    );
  }

  for (const p of products) {
    const pMod = (p.updatedAt ? new Date(p.updatedAt) : new Date()).toISOString();
    urlEntries.push(
      `  <url>\n    <loc>${escapeXml(`${baseUrl}/product/${p.slug || p._id}`)}</loc>\n    <lastmod>${pMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    );
  }

  const policySlugs = [
    "about-us",
    "privacy-policy",
    "terms-and-conditions",
    "return-policy",
  ];
  for (const slug of policySlugs) {
    urlEntries.push(
      `  <url>\n    <loc>${escapeXml(`${baseUrl}/policies/${slug}`)}</loc>\n    <lastmod>${lastModIso}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.3</priority>\n  </url>`
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join("\n")}\n</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
