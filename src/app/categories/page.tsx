import { headers } from 'next/headers';
import { getTheme } from '@/core/api/store';
import { themeRegistry } from '@/themes/themeRegistry';

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
