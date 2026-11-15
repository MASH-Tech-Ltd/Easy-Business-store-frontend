import { NextResponse } from "next/server";
import { storefrontFetch, getStorefrontApiUrl } from "@/utils/storefrontFetch";
import { getStoreInfo } from "@/core/api/store";
import { getRequestContext, getSiteOrigin } from "@/utils/seo";
import { toCdnUrl } from "@/utils/imageOptimizer";

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
    const apiUrl = getStorefrontApiUrl();
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
      `/storefront/${tenantSlug}/${path}`,
      { next: { revalidate: 3600, tags: [`tenant-${tenantSlug}`] } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data?.data || json?.data || [];
    return Array.isArray(data) ? data : [];
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
        `/storefront/${tenantSlug}/products?page=${page}&limit=100`,
        { next: { revalidate: 3600, tags: [`tenant-${tenantSlug}`] } },
      );
      if (!res.ok) break;
      const json = await res.json();
      const items = json?.data?.data || (Array.isArray(json?.data) ? json.data : []);
      if (!Array.isArray(items) || items.length === 0) break;
      all.push(...items);
      const totalPages = json?.data?.pagination?.totalPages ?? 1;
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
  // Google Search Console reads this single file and automatically discovers all stores!
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
    `  <url>\n    <loc>${escapeXml(`${baseUrl}/products`)}</loc>\n    <lastmod>${lastModIso}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    `  <url>\n    <loc>${escapeXml(`${baseUrl}/categories`)}</loc>\n    <lastmod>${lastModIso}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    `  <url>\n    <loc>${escapeXml(`${baseUrl}/track-order`)}</loc>\n    <lastmod>${lastModIso}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
  ];

  // Policies (Privacy, Terms, Return, About Us)
  const policySlugs = [
    "privacy-policy",
    "terms-and-conditions",
    "return-policy",
    "about-us",
  ];
  for (const slug of policySlugs) {
    urlEntries.push(
      `  <url>\n    <loc>${escapeXml(`${baseUrl}/policies/${slug}`)}</loc>\n    <lastmod>${lastModIso}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
    );
  }

  // Categories
  for (const c of categories) {
    const cMod = (c.updatedAt ? new Date(c.updatedAt) : new Date()).toISOString();
    const rawCatSlug = String(c.slug || c._id || "").trim();
    if (!rawCatSlug) continue;
    const encodedCatSlug = encodeURIComponent(decodeURIComponent(rawCatSlug));
    const catName = c.name || "";
    const rawCatImg = c.image?.secure_url || c.image?.url || (typeof c.image === "string" ? c.image : "");
    const catImg = rawCatImg ? toCdnUrl(rawCatImg) : "";

    urlEntries.push(
      `  <url>\n    <loc>${escapeXml(`${baseUrl}/category/${encodedCatSlug}`)}</loc>\n    <lastmod>${cMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>${
        catImg
          ? `\n    <image:image>\n      <image:loc>${escapeXml(catImg)}</image:loc>\n      <image:title>${escapeXml(catName)}</image:title>\n    </image:image>`
          : ""
      }\n  </url>`
    );
  }

  // Products
  for (const p of products) {
    const pMod = (p.updatedAt ? new Date(p.updatedAt) : new Date()).toISOString();
    const rawProdSlug = String(p.slug || p._id || "").trim();
    if (!rawProdSlug) continue;
    const encodedProdSlug = encodeURIComponent(decodeURIComponent(rawProdSlug));
    const prodTitle = p.title || p.name || "";
    const rawProdImg =
      p.images?.[0] ||
      p.image?.secure_url ||
      p.image?.url ||
      (typeof p.image === "string" ? p.image : "");
    const actualProdImg =
      typeof rawProdImg === "string"
        ? rawProdImg
        : rawProdImg?.secure_url || rawProdImg?.url || "";
    const prodImg = actualProdImg ? toCdnUrl(actualProdImg) : "";

    urlEntries.push(
      `  <url>\n    <loc>${escapeXml(`${baseUrl}/product/${encodedProdSlug}`)}</loc>\n    <lastmod>${pMod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>${
        prodImg
          ? `\n    <image:image>\n      <image:loc>${escapeXml(prodImg)}</image:loc>\n      <image:title>${escapeXml(prodTitle)}</image:title>\n    </image:image>`
          : ""
      }\n  </url>`
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urlEntries.join("\n")}\n</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
