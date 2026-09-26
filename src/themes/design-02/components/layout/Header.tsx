import { storefrontFetch } from "@/utils/storefrontFetch";
﻿import Link from 'next/link';
import { headers } from 'next/headers';
import GlobalSearch from '../ui/GlobalSearch';
import HeaderCartIcon02 from '../ui/HeaderCartIcon';
import { getTranslation } from '@/utils/translations';


async function getTheme(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

export default async function Header({ storeInfo }: { storeInfo: any }) {
  const headersList = await headers();
  const theme = await getTheme(headersList.get('x-tenant-slug') || 'main');
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  const language = theme?.language || 'en';
  const t = (key: any) => getTranslation(language, key);

  return (
    <header className="py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex w-full md:w-auto items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            <Link prefetch={false} href="/" className="flex items-center gap-3">
              {storeInfo?.logo && (
                <img src={storeInfo.logo} alt={storeInfo?.name || 'Minimal Store'} className="w-8 h-8 rounded-full object-cover" />
              )}
              <span>{storeInfo?.name || 'Minimal Store'}</span>
            </Link>
          </h1>
          <div className="md:hidden flex items-center">
            <HeaderCartIcon02 />
          </div>
        </div>
        
        {/* Search Bar - Full width on mobile, centered on desktop */}
        <div className="w-full md:flex-1 md:max-w-xl mx-0 md:mx-4">
          <GlobalSearch tenantSlug={tenantSlug} />
        </div>
        <nav className="flex items-center space-x-8 text-sm font-medium hidden md:flex">
          <Link prefetch={false} href="/" className="hover:text-gray-500 transition-colors">{t('home') || 'Home'}</Link>
          <Link prefetch={false} href="/categories" className="hover:text-gray-500 transition-colors">{t('shop') || 'Shop'}</Link>
          <HeaderCartIcon02 />
        </nav>
      </div>
    </header>
  );
}
