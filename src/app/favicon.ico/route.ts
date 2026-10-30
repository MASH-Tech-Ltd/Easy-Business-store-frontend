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
        
        try {
          const imgRes = await fetch(logo, { next: { revalidate: 86400 } });
          if (imgRes.ok) {
            const buffer = await imgRes.arrayBuffer();
            const contentType = imgRes.headers.get("content-type") || "image/png";
            return new NextResponse(buffer, {
              status: 200,
              headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
              },
            });
          }
        } catch {
          // If direct proxy fails, fallback to 302 redirect WITHOUT noindex
          return NextResponse.redirect(logo, {
            status: 302,
            headers: {
              "Cache-Control": "public, max-age=86400, s-maxage=604800",
            },
          });
        }
      }
    }
  } catch {
    // Fall through to fallback
  }

  // Fallback icon for crawlers and browsers (NO noindex header, so Googlebot can freely index)
  return new NextResponse(FALLBACK_FAVICON_SVG, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}

