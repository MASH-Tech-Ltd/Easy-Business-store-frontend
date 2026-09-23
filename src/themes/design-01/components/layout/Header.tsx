import { storefrontFetch } from "../../../../utils/storefrontFetch";
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import HeaderCartIcon from '../ui/HeaderCartIcon';
import GlobalSearch from '../ui/GlobalSearch';
import { getTranslation } from '@/utils/translations';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

export default async function Header() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  const storeInfo = await getStoreInfo(tenantSlug);

  const language = storeInfo?.language || "en";
  const t = (key: any) => getTranslation(language, key);
  return (
    <header id="main-header" className="bg-white border-b border-gray-100 py-4 sm:py-6 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Top Row on Mobile: Logo + Mobile Nav */}
        <div className="flex justify-between items-center w-full md:w-auto">
          <Link prefetch={false} href="/" className="flex items-center gap-3">
            {storeInfo?.logo && (
              <img src={storeInfo.logo} alt={storeInfo?.name || tenantSlug} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm border border-gray-100" />
            )}
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 uppercase">
              {storeInfo?.name || tenantSlug}
            </h1>
          </Link>
          
          <nav className="flex md:hidden items-center gap-4 font-semibold text-sm text-gray-600">
            <Link prefetch={false} href="/" className="hover:text-gray-900 transition-colors">{t('home') || 'Home'}</Link>
            <HeaderCartIcon />
          </nav>
        </div>

        {/* Search Bar - Full width on mobile, centered on desktop */}
        <div className="w-full md:flex-1 md:max-w-xl">
          <GlobalSearch tenantSlug={tenantSlug} />
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 font-semibold text-sm text-gray-600">
          <Link prefetch={false} href="/" className="hover:text-gray-900 transition-colors">{t('home') || 'Home'}</Link>
          <HeaderCartIcon />
        </nav>

      </div>
    </header>
  );
}
