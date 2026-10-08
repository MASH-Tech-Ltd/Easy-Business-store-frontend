import type { Metadata } from "next";
import { Inter, Outfit, Roboto, Hind_Siliguri } from "next/font/google";
import { headers } from "next/headers";
import { cache } from "react";
import { notFound } from "next/navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});
const hindSiliguri = Hind_Siliguri({
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-hind-siliguri",
});
import Providers from "../components/Providers";
import { LanguageProvider } from "../context/LanguageContext";
import VisitTracker from "../components/VisitTracker";
import StorefrontTracker from "../components/StorefrontTracker";
import AnnouncementBar from "../components/AnnouncementBar";

import { storefrontFetch } from "@/utils/storefrontFetch";

const getTheme = cache(async (tenantSlug: string) => {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}`] } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
});

const getStoreInfo = cache(async (tenantSlug: string) => {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}`] } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
});

const getStoreStatus = cache(async (tenantSlug: string) => {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/status`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}`] } }
    );
    if (!res.ok) {
      if (res.status === 404) return { storeDown: true, reason: 'Store not found' };
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
});

const getTrackingConfig = cache(async (tenantSlug: string) => {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/tracking`,
      { next: { revalidate: 60, tags: [`tenant-${tenantSlug}`] } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
});

/** Strip any " - PLATFORM" or " | PLATFORM" suffix that may have been saved in the DB */
function cleanStoreName(raw: string): string {
  return raw
    .replace(/\s*[-|]\s*MASH\s*ECO\s*$/i, '')
    .trim();
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const tenantSlug = headersList.get("x-tenant-slug") || "main";
  const storeInfo = await getStoreInfo(tenantSlug);

  const storeStatus = await getStoreStatus(tenantSlug);
  const theme = await getTheme(tenantSlug);
  
  if (tenantSlug !== "main" && (!storeInfo || storeStatus?.storeDown || storeStatus?.reason === 'Store not found')) {
    return {
      title: 'Store Offline',
      robots: { index: false, follow: false },
    };
  }

  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const rawName = storeInfo?.name ?? `${tenantSlug.toUpperCase()} Store`;
  const title = cleanStoreName(rawName);
  const description = storeInfo?.description || `Welcome to ${title}`;
  
  let faviconUrl = storeInfo?.logo || "/favicon.ico";
  let appleIconUrl = faviconUrl;
  
  if (faviconUrl.includes("cloudinary.com")) {
    faviconUrl = faviconUrl.replace(/\.[^/.]+$/, ".png");
    appleIconUrl = faviconUrl.replace("/upload/", "/upload/w_180,h_180,c_fill,f_png/");
    faviconUrl = faviconUrl.replace("/upload/", "/upload/w_192,h_192,c_fill,f_png/");
  }

  const defaultOgImage = `${baseUrl}/default-og-image.jpg`; // Fallback image

  return {
    metadataBase: new URL(baseUrl),
    applicationName: title,
    appleWebApp: {
      title: title,
      statusBarStyle: 'default',
    },
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    icons: {
      icon: [
        { url: faviconUrl, sizes: '192x192', type: 'image/png' },
      ],
      shortcut: [faviconUrl],
      apple: [
        { url: appleIconUrl, sizes: '180x180', type: 'image/png' },
      ],
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: title,
      images: [{ url: storeInfo?.logo || defaultOgImage }],
      locale: theme?.language === 'bn' ? 'bn_BD' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [storeInfo?.logo || defaultOgImage],
    }
  };
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const tenantSlug = headersList.get("x-tenant-slug") || "main";

  const theme = await getTheme(tenantSlug);
  const storeInfo = await getStoreInfo(tenantSlug);
  const storeStatus = await getStoreStatus(tenantSlug);
  const trackingConfig = await getTrackingConfig(tenantSlug);

  if ((!storeInfo || storeStatus?.reason === 'Store not found') && tenantSlug !== "main") {
    notFound();
  }

  if (storeStatus?.storeDown && tenantSlug !== "main") {
    const isTrialExpired = storeStatus.reason === "Trial expired";
    const isExpired = storeStatus.reason === "Subscription expired";
    const hasNoPlan = storeStatus.reason === "No active subscription";
    const storeName = storeInfo?.name || tenantSlug;
    const storeLogo = storeInfo?.logo;

    // Color scheme: amber for trial expired, red for subscription expired/no plan
    const accentColor = isTrialExpired ? '#f59e0b' : '#ef4444';
    const accentBg = isTrialExpired
      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
      : 'linear-gradient(135deg, #ef4444, #b91c1c)';
    const accentGlow = isTrialExpired
      ? 'rgba(245,158,11,0.4)'
      : 'rgba(239,68,68,0.4)';
    const ringColor = isTrialExpired
      ? 'rgba(245,158,11,0.5)'
      : 'rgba(239,68,68,0.5)';

    return (
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased`}>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
            @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
            @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .animate-float { animation: float 3s ease-in-out infinite; }
            .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
            .animate-fade-up { animation: fade-up 0.6s ease both; }
            .animate-fade-up-1 { animation: fade-up 0.6s 0.1s ease both; }
            .animate-fade-up-2 { animation: fade-up 0.6s 0.2s ease both; }
            .animate-fade-up-3 { animation: fade-up 0.6s 0.3s ease both; }
          ` }} />

          {/* Full-screen gradient background */}
          <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative background blobs */}
            <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(120, 60, 255, 0.15)', filter: 'blur(60px)' }} />
            <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255, 60, 120, 0.12)', filter: 'blur(60px)' }} />

            {/* Card */}
            <div className="animate-fade-up" style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '28px',
              padding: '48px 40px',
              maxWidth: '480px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
              position: 'relative',
            }}>

              {/* Icon area */}
              <div className="animate-float" style={{ marginBottom: '28px', position: 'relative', display: 'inline-block' }}>
                {/* Pulse ring */}
                <div className="animate-pulse-ring" style={{
                  position: 'absolute', inset: '-8px', borderRadius: '50%',
                  border: `2px solid ${ringColor}`,
                }} />
                {storeLogo ? (
                  <img
                    src={storeLogo}
                    alt={storeName}
                    style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: accentBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 8px 24px ${accentGlow}`,
                  }}>
                    {isTrialExpired ? (
                      <svg width="36" height="36" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    ) : (
                      <svg width="36" height="36" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                        <path d="M12 8v4M12 16h.01" />
                      </svg>
                    )}
                  </div>
                )}
                {/* Status badge */}
                <div style={{
                  position: 'absolute', bottom: '-4px', right: '-4px',
                  background: accentColor, borderRadius: '50%',
                  width: '24px', height: '24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid rgba(15,12,41,1)',
                }}>
                  {isTrialExpired ? (
                    <svg width="11" height="11" fill="white" viewBox="0 0 24 24">
                      <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5v5l4 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Store name */}
              <p className="animate-fade-up-1" style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>
                {storeName}
              </p>

              {/* Main heading */}
              <h1 className="animate-fade-up-1" style={{
                fontSize: '28px', fontWeight: 900, color: '#ffffff',
                lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.5px',
              }}>
                {isTrialExpired ? 'Free Trial Ended' : isExpired ? 'Subscription Expired' : hasNoPlan ? 'No Active Plan' : 'Store Offline'}
              </h1>

              {/* Description */}
              <p className="animate-fade-up-2" style={{
                fontSize: '15px', color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.7, marginBottom: '28px',
              }}>
                {isTrialExpired
                  ? `The 5-day free trial for this store has ended. The owner needs to upgrade to a paid plan to bring the store back online.`
                  : isExpired
                  ? `The subscription for this store has expired. The store is currently offline until the owner renews their plan.`
                  : hasNoPlan
                  ? `This store does not have an active subscription plan. Please contact the store owner to activate a plan.`
                  : `This store is temporarily unavailable. Please check back later.`
                }
              </p>

              {/* Info box */}
              <div className="animate-fade-up-2" style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '14px',
                padding: '16px 20px',
                marginBottom: '28px',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                textAlign: 'left',
              }}>
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  <svg width="16" height="16" fill="none" stroke="rgba(251,191,36,1)" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                  {isTrialExpired
                    ? `Are you the store owner? Your free trial has ended. Log in to your merchant dashboard and choose a paid plan to go live again.`
                    : isExpired
                    ? `Are you the store owner? Log in to your merchant dashboard and renew your subscription to bring your store back online.`
                    : `Are you the store owner? Visit your merchant dashboard to activate a subscription plan.`
                  }
                </p>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                  Powered by{' '}
                  <a href="https://www.masheco.com" target="_blank" rel="noopener noreferrer" className="text-[rgba(255,255,255,0.45)] hover:text-[rgba(255,255,255,0.8)] transition-colors duration-200" style={{ fontWeight: 600, textDecoration: 'none' }}>
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
  const encodedFont = encodeURIComponent(selectedFont).replace(/%20/g, '+');
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

  return (
    <html lang={language}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={googleFontHref} />
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
        {/* WebSite & Organization JSON-LD – Required for Google Site Name, Store Logo & Sitelinks */}
        {storeInfo && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [
                  {
                    '@type': 'WebSite',
                    '@id': `${baseUrl}/#website`,
                    url: `${baseUrl}`,
                    name: cleanStoreName(storeInfo.name),
                    alternateName: [cleanStoreName(storeInfo.name), tenantSlug.toUpperCase()],
                    publisher: {
                      '@id': `${baseUrl}/#organization`,
                    },
                    potentialAction: {
                      '@type': 'SearchAction',
                      target: {
                        '@type': 'EntryPoint',
                        urlTemplate: `${baseUrl}/products?search={search_term_string}`,
                      },
                      'query-input': 'required name=search_term_string',
                    },
                  },
                  {
                    '@type': ['Organization', 'OnlineStore'],
                    '@id': `${baseUrl}/#organization`,
                    name: cleanStoreName(storeInfo.name),
                    url: `${baseUrl}`,
                    logo: storeInfo.logo
                      ? {
                          '@type': 'ImageObject',
                          url: storeInfo.logo,
                          caption: cleanStoreName(storeInfo.name),
                        }
                      : undefined,
                    description: storeInfo.description || undefined,
                    telephone: storeInfo.phone || undefined,
                    contactPoint: storeInfo.phone
                      ? [
                          {
                            '@type': 'ContactPoint',
                            telephone: storeInfo.phone,
                            contactType: 'customer service',
                          },
                        ]
                      : undefined,
                  },
                ],
              }),
            }}
          />
        )}
        <LanguageProvider initialLanguage={language}>
          <Providers>
            <StorefrontTracker tenantSlug={tenantSlug} initialConfig={trackingConfig} />
            {storeInfo?._id && <VisitTracker tenantId={storeInfo._id} />}
            <AnnouncementBar banner={theme?.banner} currencySymbol={theme?.currencySymbol} />
            {children}
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
