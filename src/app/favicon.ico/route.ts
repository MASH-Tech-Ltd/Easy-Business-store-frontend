import { NextResponse } from "next/server";
import { getRequestContext } from "@/utils/seo";
import { getStoreInfo } from "@/core/api/store";
import { getFaviconUrl, toCdnUrl } from "@/utils/imageOptimizer";

export const dynamic = "force-dynamic";

// Minimal valid fallback icon to ensure search crawlers and browsers never receive HTTP 404
const FALLBACK_FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#2563eb"/><text x="50" y="62" font-size="38" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="bold">M</text></svg>`;

export async function GET() {
  try {
    const { tenantSlug } = await getRequestContext();
    if (tenantSlug && tenantSlug !== "main") {
      const storeInfo = await getStoreInfo(tenantSlug);
      const rawLogo = storeInfo?.logo;
      const logoUrl =
        typeof rawLogo === "string"
          ? rawLogo
          : rawLogo?.secure_url || rawLogo?.url || "";

      if (logoUrl && typeof logoUrl === "string" && logoUrl.trim() !== "") {
        const candidateUrls = [
          getFaviconUrl(logoUrl, 192),
          getFaviconUrl(logoUrl, 32),
          toCdnUrl(logoUrl),
          logoUrl,
        ].filter(Boolean);

        for (const candidate of candidateUrls) {
          if (!candidate.startsWith("http://") && !candidate.startsWith("https://")) {
            continue;
          }

          try {
            const imgRes = await fetch(candidate, {
              headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
              },
              next: { revalidate: 86400 },
            });

            if (imgRes.ok) {
              const buffer = await imgRes.arrayBuffer();
              const contentType = imgRes.headers.get("content-type") || "image/png";
              return new NextResponse(buffer, {
                status: 200,
                headers: {
                  "Content-Type": contentType,
                  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
                },
              });
            }
          } catch {
            // Try next candidate URL
          }
        }

        // If direct byte-proxy failed, redirect directly so browser/crawlers fetch the image directly
        const redirectTarget = getFaviconUrl(logoUrl, 192) || logoUrl;
        if (redirectTarget.startsWith("http://") || redirectTarget.startsWith("https://")) {
          return NextResponse.redirect(redirectTarget, {
            status: 302,
            headers: {
              "Cache-Control": "public, max-age=3600, s-maxage=86400",
            },
          });
        }
      }
    }
  } catch (err) {
    // Fall through to fallback
  }

  // Fallback icon for crawlers and browsers (NO CDN caching so fallback never gets permanently stuck)
  return new NextResponse(FALLBACK_FAVICON_SVG, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
