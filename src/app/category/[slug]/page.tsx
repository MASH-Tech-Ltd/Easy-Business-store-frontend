import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTheme, getStoreInfo } from '@/core/api/store';
import { getCategories } from '@/core/api/category';
import { getProducts } from '@/core/api/product';
import { themeRegistry } from '@/themes/themeRegistry';
import { getStoreName, getRequestContext, getSiteOrigin } from '@/utils/seo';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug || '');
  const { tenantSlug, requestOrigin } = await getRequestContext();

  const [storeInfo, categories] = await Promise.all([
    getStoreInfo(tenantSlug),
    getCategories(tenantSlug),
  ]);

  const category = categories?.find(
    (c: any) =>
      c.slug === decodedSlug ||
      c.slug === resolvedParams.slug ||
      c._id === decodedSlug ||
      c._id === resolvedParams.slug
  );

  if (!category && tenantSlug !== 'main') {
    return {
      title: 'Category Not Found',
      robots: { index: false, follow: false },
    };
  }

  const categoryName = category?.name
    ? category.name
    : decodedSlug
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
  const baseUrl = getSiteOrigin(requestOrigin, storeInfo);
  const storeName = getStoreName(storeInfo, tenantSlug);

  // Fetch products in this category to calculate dynamic price range for rich results
  const products = await getProducts(
    tenantSlug,
    `category=${category?._id || resolvedParams.slug}&limit=20`
  );
  const prices = products
    .map((p: any) => p.salePrice ?? p.price)
    .filter((pr: any) => typeof pr === 'number' && pr > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const priceText =
    minPrice > 0
      ? ` Price in Bangladesh starts from ৳${minPrice.toLocaleString()}${
          maxPrice > minPrice ? ` to ৳${maxPrice.toLocaleString()}` : ''
        }.`
      : '';

  const title = `${categoryName} Price in Bangladesh | ${storeName}`;
  const description =
    category?.description ||
    `Shop authentic ${categoryName} online at ${storeName}.${priceText} Fast home delivery and cash on delivery available across Bangladesh.`;

  const ogImage =
    category?.image?.secure_url ||
    category?.image ||
    storeInfo?.logo ||
    null;

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: [
      categoryName,
      `${categoryName} Price in Bangladesh`,
      `${categoryName} price in BD`,
      storeName,
      'buy online Bangladesh',
      'ecommerce',
    ].join(', '),
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
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug || '');
  const { tenantSlug, requestOrigin } = await getRequestContext();

  let themeId = 'design-01';
  let storeInfo = null;
  let categories: any[] = [];
  let category: any = null;
  let products: any[] = [];

  if (tenantSlug !== 'main') {
    const [themeRes, storeInfoRes, catRes] = await Promise.all([
      getTheme(tenantSlug),
      getStoreInfo(tenantSlug),
      getCategories(tenantSlug),
    ]);
    if (themeRes?.themeId && themeRegistry[themeRes.themeId]) {
      themeId = themeRes.themeId;
    }
    storeInfo = storeInfoRes;
    categories = catRes || [];
    category = categories.find(
      (c: any) =>
        c.slug === decodedSlug ||
        c.slug === resolvedParams.slug ||
        c._id === decodedSlug ||
        c._id === resolvedParams.slug
    );
    if (category?._id || decodedSlug) {
      products = await getProducts(
        tenantSlug,
        `category=${category?._id || decodedSlug}&limit=20`
      );
    }
  }

  if (!category && tenantSlug !== 'main') {
    notFound();
  }

  const baseUrl = getSiteOrigin(requestOrigin, storeInfo);
  const storeName = getStoreName(storeInfo, tenantSlug);
  const categoryName = category?.name
    ? category.name
    : decodedSlug
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

  const prices = products
    .map((p: any) => p.salePrice ?? p.price)
    .filter((pr: any) => typeof pr === 'number' && pr > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  // BreadcrumbList JSON-LD for Google Sitelinks / Category path
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: `${baseUrl}/categories`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `${baseUrl}/category/${resolvedParams.slug}`,
      },
    ],
  };

  // CollectionPage JSON-LD with AggregateOffer for Price snippets in Google
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} Price in Bangladesh`,
    description: `Shop authentic ${categoryName} online at ${storeName}. Prices starting from BDT ${minPrice}.`,
    url: `${baseUrl}/category/${resolvedParams.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      name: categoryName,
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((prod: any, idx: number) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${baseUrl}/product/${prod.slug || prod._id}`,
        name: prod.title,
      })),
    },
    ...(minPrice > 0
      ? {
          offers: {
            '@type': 'AggregateOffer',
            lowPrice: minPrice,
            highPrice: maxPrice,
            priceCurrency: storeInfo?.currency || 'BDT',
            offerCount: products.length,
          },
        }
      : {}),
  };

  const ThemeCategory = themeRegistry[themeId]?.Category || themeRegistry['design-01'].Category;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <ThemeCategory tenantSlug={tenantSlug} params={params} searchParams={searchParams} />
    </>
  );
}
