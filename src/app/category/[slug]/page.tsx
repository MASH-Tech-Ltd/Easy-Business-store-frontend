import { headers } from 'next/headers';
import { getTheme } from '@/core/api/store';
import { themeRegistry } from '@/themes/themeRegistry';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
