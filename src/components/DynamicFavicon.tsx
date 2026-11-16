"use client";

import { useEffect } from "react";

interface DynamicFaviconProps {
  iconUrl?: string;
  appleIconUrl?: string;
}

/**
 * DynamicFavicon - Ensures the browser tab icon and touch icons are dynamically
 * synchronized to the merchant's live uploaded logo on the client side.
 */
export default function DynamicFavicon({ iconUrl, appleIconUrl }: DynamicFaviconProps) {
  useEffect(() => {
    if (typeof window === "undefined" || !iconUrl) return;

    const setFavicon = (href: string, rel: string, sizes?: string, type?: string) => {
      let link = document.querySelector(
        `link[rel='${rel}']${sizes ? `[sizes='${sizes}']` : ""}`
      ) as HTMLLinkElement;

      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        if (sizes) link.sizes = sizes;
        if (type) link.type = type;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    try {
      // Dynamic client-side favicon update to merchant logo
      setFavicon(iconUrl, "icon", "192x192", "image/png");
      setFavicon(iconUrl, "icon", "32x32", "image/png");
      setFavicon("/favicon.ico", "shortcut icon");
      if (appleIconUrl) {
        setFavicon(appleIconUrl, "apple-touch-icon", "180x180", "image/png");
      }
    } catch {
      // Ignore DOM exceptions silently
    }
  }, [iconUrl, appleIconUrl]);

  return null;
}
