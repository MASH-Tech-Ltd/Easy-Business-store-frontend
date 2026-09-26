import { headers } from 'next/headers';
import { getTheme, getStoreInfo } from '@/core/api/store';
import { getProductBySlug } from '@/core/api/product';
import { themeRegistry } from '@/themes/themeRegistry';
import type { Metadata, ResolvingMetadata } from 'next';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const [storeInfo, product] = await Promise.all([
    getStoreInfo(tenantSlug),
    getProductBySlug(tenantSlug, resolvedParams.slug)
  ]);
  
  if (!product) {
    return { title: 'Product Not Found' };
  }
  
  const title = `${product.title} | ${storeInfo?.name || tenantSlug.toUpperCase()}`;
  const description = product.shortDescription || product.description?.substring(0, 160)?.replace(/<[^>]*>?/gm, '') || `Buy ${product.title}`;

  const fallbackImage = storeInfo?.logo || '/favicon.ico';
  const imageUrl = product.images?.[0]?.secure_url || fallbackImage;

  return {
    title,
    description,
    keywords: [
      product.title,
      product.category,
      product.brand,
      storeInfo?.name,
      'buy online',
      'ecommerce',
    ].filter(Boolean).join(', '),
    alternates: {
      canonical: `${baseUrl}/product/${resolvedParams.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/product/${resolvedParams.slug}`,
      siteName: storeInfo?.name || tenantSlug.toUpperCase(),
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.title,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    }
  };
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  let themeId = 'design-01';
  let product = null;
  let storeInfo = null;

  if (tenantSlug !== 'main') {
    [product, storeInfo] = await Promise.all([
      getProductBySlug(tenantSlug, resolvedParams.slug),
      getStoreInfo(tenantSlug),
    ]);
    const theme = await getTheme(tenantSlug);
    if (theme && theme.themeId && themeRegistry[theme.themeId]) {
      themeId = theme.themeId;
    }
  }

  // Build JSON-LD Product structured data for Google rich results
  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription || product.description?.replace(/<[^>]*>?/gm, '') || product.title,
    image: product.images?.map((img: any) => img.secure_url).filter(Boolean) || [],
    sku: product.sku || product._id,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${resolvedParams.slug}`,
      priceCurrency: storeInfo?.currency || 'BDT',
      price: product.salePrice ?? product.price ?? 0,
      availability:
        (product.stock ?? 1) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: storeInfo?.name || tenantSlug.toUpperCase(),
      },
    },
  } : null;

  const ThemeProduct = themeRegistry[themeId]?.Product || themeRegistry['design-01'].Product;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ThemeProduct tenantSlug={tenantSlug} params={params} />
    </>
  );
}
