import type { Metadata } from "next";
import { Inter, Outfit, Roboto, Noto_Sans_Bengali } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});
const notoSansBengali = Noto_Sans_Bengali({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["bengali"],
  variable: "--font-noto-sans-bengali",
});

async function getTheme(tenantSlug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

async function getStoreStatus(tenantSlug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/status`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const tenantSlug = headersList.get("x-tenant-slug") || "main";
  const storeInfo = await getStoreInfo(tenantSlug);

  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const title = storeInfo?.name ? storeInfo.name : `${tenantSlug.toUpperCase()} Store`;
  const description = storeInfo?.description || "Powered by MashEasy SaaS Platform";
  let faviconUrl = storeInfo?.logo || "/favicon.ico";
  if (faviconUrl.includes("cloudinary.com")) {
    // Force the extension to be .png so Cloudinary natively supports transparency
    faviconUrl = faviconUrl.replace(/\.[^/.]+$/, ".png");
    faviconUrl = faviconUrl.replace("/upload/", "/upload/w_64,h_64,c_fill,r_max,f_png/");
    // Add a random query parameter to bust the browser's aggressive favicon cache
    faviconUrl = `${faviconUrl}?v=${Date.now()}`;
  }

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    icons: {
      icon: faviconUrl,
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: title,
      images: storeInfo?.logo ? [{ url: storeInfo.logo }] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: storeInfo?.logo ? [storeInfo.logo] : [],
    }
  };
}

import Providers from "../components/Providers";
import { LanguageProvider } from "../context/LanguageContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug") || "main";

  const theme = await getTheme(tenantSlug);
  const storeInfo = await getStoreInfo(tenantSlug);

  if (!storeInfo && tenantSlug !== "main") {
    return (
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
          <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                Store Not Found
              </h1>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                The store you are looking for at{" "}
                <b className="text-gray-800">{tenantSlug}</b> does not exist or
                has been disabled.
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  const storeStatus = await getStoreStatus(tenantSlug);

  if (storeStatus?.storeDown && tenantSlug !== "main") {
    return (
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
          <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-lg w-full border border-gray-100">
              {storeInfo?.logo ? (
                <img
                  src={storeInfo.logo}
                  alt={storeInfo.name}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-6"
                />
              ) : (
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              )}
              <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                Store Temporarily Unavailable
              </h1>
              <p className="text-gray-600 font-medium text-base leading-relaxed mb-6">
                This store is currently offline. The owner needs to renew their
                subscription to restore access.
              </p>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">
                  If you are the owner, please log in to your merchant dashboard
                  to reactivate your store.
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

  const fontChoice = theme?.fontFamily?.toLowerCase() || "inter";
  const themeId = theme?.themeId || "light";

  let fontClass = inter.variable;
  if (fontChoice === "outfit") fontClass = outfit.variable;
  if (fontChoice === "roboto") fontClass = roboto.variable;

  // Append Bengali font variable so it's available
  fontClass = `${fontClass} ${notoSansBengali.variable}`;

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
      <body
        suppressHydrationWarning
        className={`${fontClass} font-sans antialiased`}
        style={{ "--primary": primaryColor } as React.CSSProperties}
      >
        {/* Dynamic global styles for the tenant's primary color and theme */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root {
            --primary-color: ${primaryColor};
            --primary-foreground: ${primaryForeground};
            --background: ${bgColor};
            --foreground: ${textColor};
            --font-sans: var(--font-${fontChoice}), sans-serif;
          }
          
          /* When language is Bengali, prepend Noto Sans Bengali to the font stack */
          html[lang="bn"] {
            --font-sans: var(--font-noto-sans-bengali), var(--font-${fontChoice}), sans-serif !important;
          }
          
          body {
            font-family: var(--font-sans) !important;
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
        <LanguageProvider initialLanguage={language}>
          <Providers>
            {children}
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
