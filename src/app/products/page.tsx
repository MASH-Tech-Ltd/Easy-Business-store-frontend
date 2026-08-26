import { headers } from 'next/headers';
import { getTheme } from '@/core/api/store';
import { themeRegistry } from '@/themes/themeRegistry';
import { Metadata, ResolvingMetadata } from 'next';

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<any> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  
  return {
    title: `All Products | ${tenantSlug}`,
    description: 'Browse all our products',
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<any> }) {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

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
