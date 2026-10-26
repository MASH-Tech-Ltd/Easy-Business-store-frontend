import { NextResponse } from "next/server";
import { getRequestContext } from "@/utils/seo";
import { getStoreInfo } from "@/core/api/store";

export const dynamic = "force-dynamic";

// Minimal valid fallback icon to ensure search crawlers and browsers never receive HTTP 404
const FALLBACK_FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#2563eb"/><text x="50" y="62" font-size="38" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="bold">M</text></svg>`;

export async function GET() {
  try {
    const { tenantSlug } = await getRequestContext();
    if (tenantSlug && tenantSlug !== "main") {
      const storeInfo = await getStoreInfo(tenantSlug);
      let logo = storeInfo?.logo;
      if (logo) {
        if (logo.includes("cloudinary.com")) {
          logo = logo.replace(/\.[^/.]+$/, ".png");
          logo = logo.replace(
            "/upload/",
            "/upload/w_192,h_192,c_fill,g_center,f_png/"
          );
        }
        return NextResponse.redirect(logo, {
          status: 301,
          headers: {
            "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
            "X-Robots-Tag": "noindex, nofollow",
          },
        });
      }
    }
  } catch {
    // Fall through to fallback
  }

  // Always return 200 OK fallback icon with X-Robots-Tag to ensure Google Search Console never logs 404
  return new NextResponse(FALLBACK_FAVICON_SVG, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
