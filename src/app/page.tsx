import { headers } from 'next/headers';
import { getTheme, getStoreInfo } from '@/core/api/store';
import { themeRegistry } from '@/themes/themeRegistry';
import type { Metadata } from 'next';

/** Strip any " - PLATFORM" or " | PLATFORM" suffix that may have been saved in the DB */
function cleanStoreName(raw: string): string {
  return raw.replace(/\s*[-|]\s*MASH\s*ECO\s*$/i, '').trim();
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  let title = 'Home';
  let description = 'Welcome to our store';
  let siteName = 'Store';
  let logo = '';

  if (tenantSlug !== 'main') {
    const storeInfo = await getStoreInfo(tenantSlug);
    title = cleanStoreName(storeInfo?.name || tenantSlug.toUpperCase());
    description = storeInfo?.description || description;
    siteName = cleanStoreName(storeInfo?.name || siteName);
    logo = storeInfo?.logo || logo;
  }

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName,
      images: logo ? [{ url: logo, alt: title }] : [],
      locale: 'en_US',
      type: 'website',
    },
  };
}

export default async function Page() {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  let themeId = 'design-01';
  let storeInfo = null;

  if (tenantSlug !== 'main') {
    const theme = await getTheme(tenantSlug);
    if (theme && theme.themeId && themeRegistry[theme.themeId]) {
      themeId = theme.themeId;
    }
    storeInfo = await getStoreInfo(tenantSlug);
  }

  const ThemeHome = themeRegistry[themeId]?.Home || themeRegistry['design-01'].Home;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: cleanStoreName(storeInfo?.name || tenantSlug.toUpperCase()),
    alternateName: cleanStoreName(storeInfo?.name || tenantSlug.toUpperCase()),
    url: baseUrl,
  };

  return (
    <>
      {storeInfo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ThemeHome tenantSlug={tenantSlug} />
    </>
  );
}

