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
  const { tenantSlug } = await getRequestContext();

  let themeId = 'design-01';

  if (tenantSlug !== 'main') {
    const theme = await getTheme(tenantSlug);
    if (theme && theme.themeId && themeRegistry[theme.themeId]) {
      themeId = theme.themeId;
    }
  }

  const ThemeHome = themeRegistry[themeId]?.Home || themeRegistry['design-01'].Home;

  // NOTE: WebSite / Organization JSON-LD (used by Google for the site name)
  // is emitted once in the root layout. Do not duplicate it here.
  return <ThemeHome tenantSlug={tenantSlug} />;
}
