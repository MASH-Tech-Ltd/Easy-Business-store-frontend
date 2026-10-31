import { headers } from 'next/headers';
import { getStoreLogoUrl } from '@/utils/imageOptimizer';
import { getTheme, getStoreInfo } from '@/core/api/store';
import { themeRegistry } from '@/themes/themeRegistry';
import { getStoreName, getRequestContext, getSiteOrigin } from '@/utils/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { tenantSlug, requestOrigin } = await getRequestContext();

  const storeInfo = await getStoreInfo(tenantSlug);
  const baseUrl = getSiteOrigin(requestOrigin, storeInfo);
  const storeName = getStoreName(storeInfo, tenantSlug);

  const title = `All Products | ${storeName}`;
  const description = `Browse all products at ${storeName}. Shop online with fast delivery and great prices.`;
  const ogImage = storeInfo?.logo ? getStoreLogoUrl(storeInfo.logo) : null;

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: [storeName, 'buy online', 'shop all products', 'ecommerce'].join(', '),
    alternates: {
      canonical: `${baseUrl}/products`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/products`,
      siteName: storeName,
      images: ogImage ? [{ url: ogImage, alt: storeName }] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<any> }) {
  const { tenantSlug } = await getRequestContext();

  let themeId = 'design-01';

  if (tenantSlug !== 'main') {
    const theme = await getTheme(tenantSlug);
    if (theme && theme.themeId && themeRegistry[theme.themeId]) {
      themeId = theme.themeId;
    }
  }

  const ThemeProducts = themeRegistry[themeId]?.Products || themeRegistry['design-04'].Products;

  return <ThemeProducts tenantSlug={tenantSlug} searchParams={searchParams} />;
}
