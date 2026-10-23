import { getTheme, getStoreInfo } from '@/core/api/store';
import { themeRegistry } from '@/themes/themeRegistry';
import { getStoreName, getRequestContext, getSiteOrigin } from '@/utils/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { tenantSlug, requestOrigin } = await getRequestContext();

  if (tenantSlug === 'main') {
    return { title: { absolute: 'Home' } };
  }

  const storeInfo = await getStoreInfo(tenantSlug);
  const baseUrl = getSiteOrigin(requestOrigin, storeInfo);
  const storeName = getStoreName(storeInfo, tenantSlug);
  const description = storeInfo?.description || `Welcome to ${storeName}`;
  const logo = storeInfo?.logo || '';

  return {
    applicationName: storeName,
    appleWebApp: {
      title: storeName,
      statusBarStyle: 'default',
      capable: true,
    },
    title: {
      absolute: storeName,
    },
    description,
    alternates: {
      canonical: `${baseUrl}/`,
    },
    openGraph: {
      title: storeName,
      description,
      url: `${baseUrl}/`,
      siteName: storeName,
      images: logo ? [{ url: logo, alt: storeName }] : [],
      type: 'website',
    },
  };
}

export default async function Page() {
  const { tenantSlug, requestOrigin } = await getRequestContext();

  let themeId = 'design-01';
  let storeInfo = null;

  if (tenantSlug !== 'main') {
    const [theme, info] = await Promise.all([
      getTheme(tenantSlug),
      getStoreInfo(tenantSlug),
    ]);
    storeInfo = info;
    if (theme && theme.themeId && themeRegistry[theme.themeId]) {
      themeId = theme.themeId;
    }
  }

  const ThemeHome = themeRegistry[themeId]?.Home || themeRegistry['design-01'].Home;

  const baseUrl = getSiteOrigin(requestOrigin, storeInfo);
  const storeName = getStoreName(storeInfo, tenantSlug);

  return (
    <>
      {storeInfo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${baseUrl}/#website`,
              name: storeName,
              alternateName: Array.from(
                new Set(
                  [
                    tenantSlug,
                    storeName.replace(/\s+/g, ""),
                  ].filter((item): item is string =>
                    Boolean(
                      item &&
                      !item.toLowerCase().includes("masheco") &&
                      !item.toLowerCase().includes(".com") &&
                      item.trim().toLowerCase() !== storeName.trim().toLowerCase()
                    )
                  )
                )
              ),
              url: `${baseUrl}/`,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${baseUrl}/products?search={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      )}
      <ThemeHome tenantSlug={tenantSlug} />
    </>
  );
}
