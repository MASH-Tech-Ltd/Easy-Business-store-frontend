import { headers } from 'next/headers';
import { getTheme, getStoreInfo } from '@/core/api/store';
import { themeRegistry } from '@/themes/themeRegistry';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const storeInfo = await getStoreInfo(tenantSlug);
  const storeName = storeInfo?.name || tenantSlug.toUpperCase();

  const title = `All Categories`;
  const description = `Browse all categories at ${storeName}. Find the best products in our organized catalog.`;
  const ogImage = storeInfo?.logo || null;

  return {
    title,
    description,
    keywords: [storeName, 'categories', 'electronics', 'shop by category'].join(', '),
    alternates: {
      canonical: `${baseUrl}/categories`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/categories`,
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

export default async function CategoriesPage() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  let themeId = 'design-01';

  if (tenantSlug !== 'main') {
    const theme = await getTheme(tenantSlug);
    if (theme && theme.themeId && themeRegistry[theme.themeId]) {
      themeId = theme.themeId;
    }
  }

  const ThemeCategories = themeRegistry[themeId]?.Categories || themeRegistry['design-01'].Categories;

  return <ThemeCategories tenantSlug={tenantSlug} />;
}
