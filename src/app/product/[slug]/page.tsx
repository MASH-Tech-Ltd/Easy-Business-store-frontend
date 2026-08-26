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

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/product/${resolvedParams.slug}`,
      siteName: storeInfo?.name || tenantSlug.toUpperCase(),
      images: product.images?.[0]?.secure_url ? [
        {
          url: product.images[0].secure_url,
          width: 800,
          height: 800,
          alt: product.title,
        }
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.images?.[0]?.secure_url ? [product.images[0].secure_url] : [],
    }
  };
}

export default async function ProductPage({ params }: PageProps) {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  let themeId = 'design-01';

  if (tenantSlug !== 'main') {
    const theme = await getTheme(tenantSlug);
    if (theme && theme.themeId && themeRegistry[theme.themeId]) {
      themeId = theme.themeId;
    }
  }

  const ThemeProduct = themeRegistry[themeId]?.Product || themeRegistry['design-01'].Product;

  return <ThemeProduct tenantSlug={tenantSlug} params={params} />;
}
