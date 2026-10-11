import type { MetadataRoute } from "next";
import { getRequestContext } from "@/utils/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { requestOrigin } = await getRequestContext();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cart", "/checkout", "/account", "/track-order", "/api/"],
      },
    ],
    // Sitemap on the same host that serves this robots.txt (Google requires same-host
    // unless cross-site ownership is verified). Its URLs point at the canonical origin.
    sitemap: `${requestOrigin}/sitemap.xml`,
  };
}
