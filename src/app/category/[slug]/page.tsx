import { headers } from 'next/headers';
import { getTheme, getStoreInfo } from '@/core/api/store';
import { getCategories } from '@/core/api/category';
import { themeRegistry } from '@/themes/themeRegistry';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const [storeInfo, categories] = await Promise.all([
    getStoreInfo(tenantSlug),
    getCategories(tenantSlug),
  ]);

  const category = categories?.find(
    (c: any) => c.slug === resolvedParams.slug || c._id === resolvedParams.slug
  );

  const categoryName = category?.name
    ? category.name
    : resolvedParams.slug
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
  const storeName = storeInfo?.name || tenantSlug.toUpperCase();

  const title = `${categoryName} | ${storeName}`;
  const description =
    category?.description ||
    `Shop ${categoryName} at ${storeName}. Browse our full selection with fast delivery and great prices.`;

  const ogImage =
    category?.image?.secure_url ||
    category?.image ||
    storeInfo?.logo ||
    null;

  return {
    title,
    description,
    keywords: [categoryName, storeName, 'buy online', 'ecommerce', 'electronics'].join(', '),
    alternates: {
      canonical: `${baseUrl}/category/${resolvedParams.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/category/${resolvedParams.slug}`,
      siteName: storeName,
      images: ogImage ? [{ url: ogImage, alt: categoryName }] : [],
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

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  let themeId = 'design-01';

  if (tenantSlug !== 'main') {
    const theme = await getTheme(tenantSlug);
    if (theme && theme.themeId && themeRegistry[theme.themeId]) {
      themeId = theme.themeId;
    }
  }

  const ThemeCategory = themeRegistry[themeId]?.Category || themeRegistry['design-01'].Category;

  return <ThemeCategory tenantSlug={tenantSlug} params={params} searchParams={searchParams} />;
}
