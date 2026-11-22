import { getStoreLogoUrl } from '@/utils/imageOptimizer';
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import HeaderCartIcon04 from '../ui/HeaderCartIcon';
import GlobalSearch04 from '../ui/GlobalSearch';
import { getTranslation } from '@/utils/translations';
import AnnouncementBar from '@/components/AnnouncementBar';
import { getStoreInfo, getTheme } from '@/core/api/store';

export default async function Header04({ storeInfo, theme: initialTheme }: { storeInfo?: any; theme?: any }) {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  const info = storeInfo || await getStoreInfo(tenantSlug);
  const theme = initialTheme || await getTheme(tenantSlug);

  const language = theme?.language || 'en';
  const t = (key: any) => getTranslation(language, key);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link prefetch={false} href="/" className="flex items-center gap-3 shrink-0">
            {info?.logo ? (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 aspect-square flex items-center justify-center bg-gray-50 border border-gray-100 shadow-2xs">
                <img src={getStoreLogoUrl(info.logo)} alt={info?.name || 'Store'} className="w-full h-full object-cover rounded-full aspect-square" />
              </div>
            ) : null}
            <h1
              style={theme?.storeTitleFont ? { fontFamily: `'${theme.storeTitleFont}', serif` } : undefined}
              className="store-title-font text-xl sm:text-2xl font-black tracking-tight text-gray-900 uppercase"
            >
              {info?.name || tenantSlug}
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <Link prefetch={false} href="/" className="hover:text-gray-900 transition-colors">{t('home') || 'Home'}</Link>
            <Link prefetch={false} href="/products" className="hover:text-gray-900 transition-colors">{t('allProducts') || 'All Products'}</Link>
            <Link prefetch={false} href="/cart" className="hover:text-gray-900 transition-colors">{t('yourBag') || 'Your Bag'}</Link>
          </nav>

          {/* Search + Cart */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block w-56 lg:w-72">
              <GlobalSearch04 tenantSlug={tenantSlug} language={language} theme={theme} />
            </div>
            <div className="sm:hidden">
              <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>
            <HeaderCartIcon04 />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="block sm:hidden w-full">
          <GlobalSearch04 tenantSlug={tenantSlug} language={language} theme={theme} />
        </div>
      </div>
    </header>
  );
}
