import { NextResponse } from "next/server";
import { getRequestContext } from "@/utils/seo";
import { getStoreInfo } from "@/core/api/store";

export const dynamic = "force-dynamic";

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
          status: 307,
          headers: {
            "Cache-Control":
              "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
          },
        });
      }
    }
  } catch {
    // fallback to 404 if store or logo not found
  }

  return new NextResponse(null, { status: 404 });
}
