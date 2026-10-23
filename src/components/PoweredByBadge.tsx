"use client";

import React, { useEffect, useState } from "react";

/**
 * PoweredByBadge - Renders "Powered by MASH ECO" exclusively for real human visitors.
 * 
 * Bulletproof Google/SEO protection:
 * 1. Client-Side Only (bypasses SSR - 0 trace in server-rendered HTML for Googlebot crawler).
 * 2. Search engine bot detection (returns null for Googlebot, Bingbot, Baidu, etc.).
 * 3. data-nosnippet="true" (Google Search strictly prohibits using this in search snippets or AI overviews).
 * 4. rel="nofollow noopener noreferrer" (prevents any PageRank or SEO link equity transfer).
 */
export default function PoweredByBadge({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect known search engine crawlers and bots
    const ua = (navigator.userAgent || "").toLowerCase();
    const isBot =
      /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkshare|w3c_validator/i.test(
        ua
      );

    if (!isBot) {
      setMounted(true);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div
      data-nosnippet="true"
      className={className || "flex items-center justify-center gap-1.5 text-[10px] text-gray-400 select-none pt-1"}
    >
      <span>Powered by</span>
      <a
        href="https://www.masheco.com"
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="font-semibold text-gray-400 hover:text-blue-500 tracking-wider transition-colors"
      >
        MASH ECO
      </a>
    </div>
  );
}
