import {
  getStoreLogoUrl,
  getFaviconUrl,
  getAppleTouchIconUrl,
} from '@/utils/imageOptimizer';
import type { Metadata } from "next";
import { Inter, Outfit, Roboto, Hind_Siliguri } from "next/font/google";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});
const hindSiliguri = Hind_Siliguri({
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-hind-siliguri",
  display: "swap",
});
import Providers from "../components/Providers";
import { LanguageProvider } from "../context/LanguageContext";
import VisitTracker from "../components/VisitTracker";
import StorefrontTracker from "../components/StorefrontTracker";
import AnnouncementBar from "../components/AnnouncementBar";
import DynamicFavicon from "../components/DynamicFavicon";

import { storefrontFetch } from "@/utils/storefrontFetch";
import {
  cleanStoreName,
  cleanMetaDescription,
  getStoreName,
  getStoreAlternateNames,
  getRequestContext,
  getSiteOrigin,
} from "@/utils/seo";
import { getCategories } from "@/core/api/category";

import {
  getStoreInfo,
  getTheme,
  getStoreStatus,
  getTrackingConfig,
} from "@/core/api/store";

export async function generateMetadata(): Promise<Metadata> {
  const { tenantSlug, requestOrigin } = await getRequestContext();
  const storeInfo = await getStoreInfo(tenantSlug);

  const storeStatus = await getStoreStatus(tenantSlug);
  const theme = await getTheme(tenantSlug);

  // Platform root (masheco.com itself) — not a storefront.
  // Emit correct MASH ECO platform branding so Google never indexes the
  // platform domain as "MAIN" or shows a blank/wrong site name for it.
  if (tenantSlug === 'main') {
    const platformOrigin = requestOrigin.includes('localhost')
      ? requestOrigin
      : 'https://www.masheco.com';
    return {
      metadataBase: new URL(platformOrigin),
      applicationName: 'MASH ECO',
      authors: [{ name: 'MASH ECO', url: `${platformOrigin}/` }],
      publisher: 'MASH ECO',
      title: {
        default: 'MASH ECO | Launch Your E-Commerce Store – Zero Coding Required',
        template: '%s | MASH ECO',
      },
      description: 'MASH ECO — Create your own online store in minutes. Multi-tenant e-commerce platform.',
      alternates: { canonical: `${platformOrigin}/` },
      openGraph: {
        title: 'MASH ECO | All-in-One E-Commerce Store Builder',
        description: 'MASH ECO — Create your own online store in minutes. Multi-tenant e-commerce platform.',
        url: `${platformOrigin}/`,
        siteName: 'MASH ECO',
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'MASH ECO',
        description: 'MASH ECO — Create your own online store in minutes.',
      },
    };
  }

  if (
    tenantSlug !== "main" &&
    (storeStatus?.storeDown ||
      storeStatus?.reason === "Store not found")
  ) {
    return {
      title: "Store Offline",
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = getSiteOrigin(requestOrigin, storeInfo);
  const title = getStoreName(storeInfo, tenantSlug);
  const defaultDesc = `${title} — Official online store. Discover genuine electronics, gadgets, and accessories with fast home delivery and cash on delivery in Bangladesh.`;
  const description = cleanMetaDescription(storeInfo?.description || defaultDesc);

  const faviconUrl192 = getFaviconUrl(storeInfo?.logo, 192);
  const faviconUrl32 = getFaviconUrl(storeInfo?.logo, 32);
  const appleIconUrl = getAppleTouchIconUrl(storeInfo?.logo);

  const defaultOgImage = `${baseUrl}/default-og-image.jpg`; // Fallback image

  return {
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/`,
    },
    applicationName: title,
    authors: [{ name: title, url: `${baseUrl}/` }],
    publisher: title,
    appleWebApp: {
      title: title,
      statusBarStyle: "default",
      capable: true,
    },
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: faviconUrl192, sizes: "192x192", type: "image/png" },
        { url: faviconUrl32, sizes: "32x32", type: "image/png" },
      ],
      shortcut: ["/favicon.ico"],
      apple: [{ url: appleIconUrl, sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/`,
      siteName: title,
      images: [{ url: storeInfo?.logo ? getStoreLogoUrl(storeInfo.logo) : defaultOgImage, alt: title }],
      locale: theme?.language === "bn" ? "bn_BD" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [storeInfo?.logo ? getStoreLogoUrl(storeInfo.logo) : defaultOgImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { tenantSlug, host, requestOrigin, pathname } = await getRequestContext();
  const isHomepage = !pathname || pathname === "/" || pathname === "/index";

  const theme = await getTheme(tenantSlug);
  const storeInfo = await getStoreInfo(tenantSlug);
  const categories =
    tenantSlug !== "main" ? await getCategories(tenantSlug) : [];
  const baseUrl = getSiteOrigin(requestOrigin, storeInfo);
  const storeName = getStoreName(storeInfo, tenantSlug);
  const storeStatus = await getStoreStatus(tenantSlug);
  const trackingConfig = await getTrackingConfig(tenantSlug);

  // Auto-redirect from platform subdomain (*.masheco.com) to verified custom domain
  if (
    tenantSlug !== "main" &&
    storeStatus?.domainStatus === "active" &&
    storeStatus?.customDomain
  ) {
    const targetCustomDomain = storeStatus.customDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .split("/")[0];

    const currentHost = host.split(":")[0].toLowerCase();
    const isLocalhost =
      currentHost.includes("localhost") ||
      currentHost === "localhost" ||
      currentHost.endsWith(".localhost");

    const baseDomain = (
      process.env.NEXT_PUBLIC_BASE_DOMAIN || "masheco.com"
    ).toLowerCase();
    const isSubdomain =
      currentHost.endsWith(`.${baseDomain}`) ||
      currentHost.endsWith(".masheco.com");

    const isAlreadyOnCustomDomain =
      currentHost === targetCustomDomain ||
      currentHost === `www.${targetCustomDomain}` ||
      targetCustomDomain === `www.${currentHost}`;

    if (
      !isLocalhost &&
      isSubdomain &&
      targetCustomDomain &&
      !isAlreadyOnCustomDomain
    ) {
      redirect(`https://${targetCustomDomain}`);
    }
  }

  if (
    storeStatus?.reason === "Store not found" &&
    tenantSlug !== "main"
  ) {
    return (
      <html lang="en">
        <head>
          <title>Store Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        </head>
        <body className={`${inter.variable} font-sans antialiased bg-gray-50 flex items-center justify-center min-h-screen p-4 sm:p-6`}>
          <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl sm:text-2xl">
              404
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">Store Not Found</h1>
            <p className="text-gray-500 text-xs sm:text-sm mb-6">
              The store <strong className="text-gray-900">{tenantSlug}</strong> does not exist or may have been removed.
            </p>
            <a
              href="https://masheco.com"
              className="inline-block px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-900 text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-gray-800 transition-colors"
            >
              Back to Masheco
            </a>
          </div>
        </body>
      </html>
    );
  }

  if (storeStatus?.storeDown && tenantSlug !== "main") {
    const isTrialExpired = storeStatus.reason === "Trial expired";
    const isExpired = storeStatus.reason === "Subscription expired";
    const hasNoPlan = storeStatus.reason === "No active subscription";
    const storeLogo = storeInfo?.logo;

    // Color scheme: amber for trial expired, red for subscription expired/no plan
    const accentColor = isTrialExpired ? "#f59e0b" : "#ef4444";
    const accentBg = isTrialExpired
      ? "linear-gradient(135deg, #f59e0b, #d97706)"
      : "linear-gradient(135deg, #ef4444, #b91c1c)";
    const accentGlow = isTrialExpired
      ? "rgba(245,158,11,0.4)"
      : "rgba(239,68,68,0.4)";
    const ringColor = isTrialExpired
      ? "rgba(245,158,11,0.5)"
      : "rgba(239,68,68,0.5)";

    return (
      <html lang="en">
        <head>
          <title>Store Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
          <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet" />
        </head>
        <body className={`${inter.variable} font-sans antialiased text-white`}>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
            @keyframes pulse-ring { 0% { transform: scale(0.92); opacity: 0.9; } 100% { transform: scale(1.35); opacity: 0; } }
            @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
            .animate-float { animation: float 3s ease-in-out infinite; }
            .animate-pulse-ring { animation: pulse-ring 2.2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
            .animate-fade-up { animation: fade-up 0.5s ease both; }
            .animate-fade-up-1 { animation: fade-up 0.5s 0.08s ease both; }
            .animate-fade-up-2 { animation: fade-up 0.5s 0.16s ease both; }
            .animate-fade-up-3 { animation: fade-up 0.5s 0.24s ease both; }
          `,
            }}
          />

          {/* Full-screen gradient background */}
          <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 relative overflow-hidden">
            {/* Decorative background blobs */}
            <div className="absolute -top-16 -left-16 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-pink-600/15 blur-3xl pointer-events-none" />

            {/* Card Container */}
            <div className="animate-fade-up w-full max-w-[460px] bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 text-center shadow-2xl relative z-10 mx-auto">
              {/* Store Avatar & Status Icon */}
              <div className="animate-float mb-4 sm:mb-6 relative inline-block">
                {/* Glowing Pulse Ring */}
                <div
                  className="animate-pulse-ring absolute -inset-2 rounded-full pointer-events-none"
                  style={{ border: `2px solid ${ringColor}` }}
                />

                {storeLogo ? (
                  <img
                    src={getStoreLogoUrl(storeLogo)}
                    alt={storeName}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-2 sm:border-[3px] border-white/20 shadow-lg mx-auto"
                  />
                ) : (
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-lg mx-auto"
                    style={{
                      background: accentBg,
                      boxShadow: `0 8px 24px ${accentGlow}`,
                    }}
                  >
                    {isTrialExpired ? (
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    ) : (
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                        <path d="M12 8v4M12 16h.01" />
                      </svg>
                    )}
                  </div>
                )}

                {/* Status mini badge */}
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 border-[#0f0c29] shadow-md"
                  style={{ background: accentColor }}
                >
                  {isTrialExpired ? (
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 6v6l4 2" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Store Name */}
              <p className="animate-fade-up-1 text-xs sm:text-sm font-semibold tracking-wider uppercase text-white/50 mb-1.5 sm:mb-2 truncate max-w-full px-2">
                {storeName}
              </p>

              {/* Main Heading */}
              <h1 className="animate-fade-up-1 text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2.5 sm:mb-3 leading-tight">
                {isTrialExpired
                  ? "Free Trial Ended"
                  : isExpired
                    ? "Subscription Expired"
                    : hasNoPlan
                      ? "No Active Plan"
                      : "Store Offline"}
              </h1>

              {/* Description */}
              <p className="animate-fade-up-2 text-xs sm:text-sm text-white/70 leading-relaxed mb-4 sm:mb-6 max-w-sm mx-auto">
                {isTrialExpired
                  ? `The 5-day free trial for this store has ended. The owner needs to upgrade to a paid plan to bring the store back online.`
                  : isExpired
                    ? `The subscription for this store has expired. The store is currently offline until the owner renews their plan.`
                    : hasNoPlan
                      ? `This store does not have an active subscription plan. Please contact the store owner to activate a plan.`
                      : `This store is temporarily unavailable. Please check back later.`}
              </p>

              {/* Info Box */}
              <div className="animate-fade-up-2 bg-white/[0.05] border border-white/10 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 mb-4 sm:mb-6 text-left flex items-start gap-2.5 sm:gap-3">
                <div className="shrink-0 mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400/10 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-[11px] sm:text-xs text-white/60 leading-relaxed space-y-2 flex-1">
                  <p>
                    {isTrialExpired
                      ? `Are you the store owner? Your free trial has ended. Log in to your merchant dashboard and choose a paid plan to go live again.`
                      : isExpired
                        ? `Are you the store owner? Log in to your merchant dashboard and renew your subscription to bring your store back online.`
                        : `Are you the store owner? Visit your merchant dashboard to activate a subscription plan.`}
                  </p>
                  {/* <a
                    href="https://merchant.masheco.com/dashboard/subscription"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2 transition-colors pt-0.5"
                  >
                    <span>Go to Merchant Dashboard</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a> */}
                </div>
              </div>

              {/* Divider & Footer */}
              <div className="border-t border-white/[0.08] pt-3 sm:pt-4">
                <p className="text-[11px] text-white/30">
                  Powered by{" "}
                  <a
                    href="https://www.masheco.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-white/70 font-semibold transition-colors"
                  >
                    MASH ECO
                  </a>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  const primaryColor = theme?.primaryColor || "#5022C3";
  const language = theme?.language || "en";

  // Calculate contrast color for text on primary backgrounds
  const getContrastColor = (hexcolor: string) => {
    // If a short hex code is provided
    if (hexcolor.length === 4) {
      hexcolor =
        "#" +
        hexcolor[1] +
        hexcolor[1] +
        hexcolor[2] +
        hexcolor[2] +
        hexcolor[3] +
        hexcolor[3];
    }
    const r = parseInt(hexcolor.slice(1, 3), 16) || 0;
    const g = parseInt(hexcolor.slice(3, 5), 16) || 0;
    const b = parseInt(hexcolor.slice(5, 7), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#ffffff";
  };
  const primaryForeground = getContrastColor(primaryColor);
  const selectedFont = theme?.fontFamily || "Inter";
  const encodedFont = encodeURIComponent(selectedFont).replace(/%20/g, "+");
  const googleFontHref = `https://fonts.googleapis.com/css2?family=${encodedFont}&display=swap`;

  const fontChoice = selectedFont.toLowerCase();
  const themeId = theme?.themeId || "light";

  let fontClass = inter.variable;
  if (fontChoice === "outfit") fontClass = outfit.variable;
  if (fontChoice === "roboto") fontClass = roboto.variable;

  // Append Bengali font variable so it's available
  fontClass = `${fontClass} ${hindSiliguri.variable}`;

  // Map theme templates to colors
  let bgColor = "#ffffff";
  let textColor = "#171717";

  if (themeId === "dark") {
    bgColor = "#0f172a";
    textColor = "#f8fafc";
  } else if (themeId === "nature") {
    bgColor = "#f0fdf4";
    textColor = "#14532d";
  } else if (themeId === "sunset") {
    bgColor = "#fffbeb";
    textColor = "#78350f";
  }

  const faviconUrl192 = getFaviconUrl(storeInfo?.logo, 192);
  const faviconUrl32 = getFaviconUrl(storeInfo?.logo, 32);
  const appleIconUrl = getAppleTouchIconUrl(storeInfo?.logo);

  return (
    <html lang={language}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={googleFontHref} />

        {/* Referrer Policy: Prevents CDN hotlinking blocks on custom domains */}
        <meta name="referrer" content="same-origin" />

        {/* Explicit Site Name meta tags for Google Search */}
        <meta property="og:site_name" content={storeName} />
        <meta name="application-name" content={storeName} />
        <meta name="apple-mobile-web-app-title" content={storeName} />

        {/* Explicit Favicons for Googlebot-Image, Google Favicon crawler, Search Results, & all browsers */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href={faviconUrl192} />
        <link rel="icon" type="image/png" sizes="32x32" href={faviconUrl32} />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href={appleIconUrl} />

        {/* Organization / OnlineStore Schema across all store subdomains and custom domains.
            Note: WebSite schema for Google Search Site Name is placed exclusively on the homepage (src/app/page.tsx)
            following Google Search guidelines to prevent duplicate schema warnings. */}
        {tenantSlug !== "main" && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "OnlineStore",
                "@id": `${baseUrl}/#organization`,
                "name": storeName,
                ...(getStoreAlternateNames(storeName).length > 0
                  ? { "alternateName": getStoreAlternateNames(storeName) }
                  : {}),
                "url": `${baseUrl}/`,
                  ...(storeInfo?.logo
                    ? {
                        "logo": {
                          "@type": "ImageObject",
                          "@id": `${baseUrl}/#logo`,
                          "url": faviconUrl192,
                          "contentUrl": faviconUrl192,
                          "caption": storeName,
                        },
                        "image": {
                          "@id": `${baseUrl}/#logo`,
                        },
                      }
                    : {}),
                  ...(storeInfo?.description
                    ? { "description": storeInfo.description }
                    : {}),
                  ...(storeInfo?.phone
                    ? { "telephone": storeInfo.phone }
                    : {}),
                  "currenciesAccepted": storeInfo?.currency || "BDT",
                  "priceRange": "৳",
                  ...(storeInfo?.address
                    ? {
                        "address": {
                          "@type": "PostalAddress",
                          "streetAddress": storeInfo.address,
                          "addressCountry": "BD",
                        },
                      }
                    : {}),
                }),
              }}
            />
        )}

        {/* 2. Google Sitelinks: SiteNavigationElement / ItemList JSON-LD */}
        {tenantSlug !== "main" && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                "itemListElement": [
                  {
                    "@type": "SiteNavigationElement",
                    "position": 1,
                    "name": "All Products",
                    "description": `Browse all products and new arrivals at ${storeName}.`,
                    "url": `${baseUrl}/products`,
                  },
                  {
                    "@type": "SiteNavigationElement",
                    "position": 2,
                    "name": "Categories",
                    "description": `Explore all product categories and collections at ${storeName}.`,
                    "url": `${baseUrl}/categories`,
                  },
                  ...categories.slice(0, 4).map((cat: any, idx: number) => ({
                    "@type": "SiteNavigationElement",
                    "position": idx + 3,
                    "name": cat.name,
                    "description":
                      cat.description ||
                      `Shop ${cat.name} online at ${storeName}.`,
                    "url": `${baseUrl}/category/${cat.slug || cat._id}`,
                  })),
                  {
                    "@type": "SiteNavigationElement",
                    "position": Math.min(categories.length, 4) + 3,
                    "name": "About Us",
                    "description": `Learn about ${storeName}, our story, and customer commitments.`,
                    "url": `${baseUrl}/policies/about-us`,
                  },
                  {
                    "@type": "SiteNavigationElement",
                    "position": Math.min(categories.length, 4) + 4,
                    "name": "Terms & Conditions",
                    "description": `Terms of service, purchasing agreements, and policies at ${storeName}.`,
                    "url": `${baseUrl}/policies/terms-and-conditions`,
                  },
                  {
                    "@type": "SiteNavigationElement",
                    "position": Math.min(categories.length, 4) + 5,
                    "name": "Return & Refund Policy",
                    "description": `Hassle-free return and refund guidelines for buyers at ${storeName}.`,
                    "url": `${baseUrl}/policies/return-policy`,
                  },
                  {
                    "@type": "SiteNavigationElement",
                    "position": Math.min(categories.length, 4) + 6,
                    "name": "Privacy Policy",
                    "description": `How ${storeName} protects your personal data and shopping privacy.`,
                    "url": `${baseUrl}/policies/privacy-policy`,
                  },
                ],
              }),
            }}
          />
        )}
      </head>
      <body
        suppressHydrationWarning
        className={`${fontClass} font-sans antialiased`}
        style={{ "--primary": primaryColor } as React.CSSProperties}
      >
        {/* Dynamic global styles for the tenant's primary color, font and theme */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root {
            --primary-color: ${primaryColor};
            --primary-foreground: ${primaryForeground};
            --background: ${bgColor};
            --foreground: ${textColor};
            --font-heading: '${selectedFont}', sans-serif;
            --font-sans: '${selectedFont}', var(--font-${fontChoice}), sans-serif;
          }
          
          /* When language is Bengali, use Hind Siliguri – compact, professional, no layout bloat */
          html[lang="bn"] {
            --font-sans: var(--font-hind-siliguri), '${selectedFont}', sans-serif !important;
            font-size: 70% !important;
            line-height: 1.5 !important;
          }
          html[lang="bn"] * {
            line-height: 1.5 !important;
          }
          
          /* Product Details section line-height */
          .rich-product-description,
          .rich-product-description *,
          html .rich-product-description,
          html .rich-product-description *,
          html[lang="bn"] .rich-product-description,
          html[lang="bn"] .rich-product-description * {
            line-height: 2.2 !important;
          }
          
          html[lang="bn"] h1,
          html[lang="bn"] h2,
          html[lang="bn"] h3,
          html[lang="bn"] h4,
          html[lang="bn"] h5,
          html[lang="bn"] h6 {
            line-height: 1.35 !important;
          }
          
          body, h1, h2, h3, h4, h5, h6, button, input, select {
            font-family: '${selectedFont}', var(--font-sans), sans-serif !important;
          }
          
          .bg-primary { background-color: var(--primary-color) !important; color: var(--primary-foreground) !important; }
          .text-primary { color: var(--primary-color) !important; }
          .border-primary { border-color: var(--primary-color) !important; }
          
          .hover\\:bg-primary:hover { 
            background-color: var(--primary-color) !important; 
            color: var(--primary-foreground) !important;
            opacity: 0.9; 
          }
          
          /* Override specific tailwind text-white classes on primary backgrounds */
          .bg-primary.text-white, .hover\\:bg-primary:hover.text-white, .hover\\:bg-primary:hover.hover\\:text-white:hover { 
            color: var(--primary-foreground) !important; 
          }
        `,
          }}
        />
        <DynamicFavicon iconUrl={faviconUrl192} appleIconUrl={appleIconUrl} />
        <LanguageProvider initialLanguage={language}>
          <Providers
            chatWidget={tenantSlug !== "main" ? theme?.chatWidget : undefined}
            storeName={storeName}
            primaryColor={primaryColor}
          >
            <StorefrontTracker
              tenantSlug={tenantSlug}
              initialConfig={trackingConfig}
            />
            {storeInfo?._id && <VisitTracker tenantId={storeInfo._id} />}
            <AnnouncementBar
              banner={theme?.banner}
              currencySymbol={theme?.currencySymbol}
            />
            {children}
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
