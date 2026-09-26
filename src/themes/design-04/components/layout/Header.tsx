import { storefrontFetch } from "../../../../utils/storefrontFetch";
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import HeaderCartIcon04 from '../ui/HeaderCartIcon';
import GlobalSearch04 from '../ui/GlobalSearch';
import { getTranslation } from '@/utils/translations';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

async function getTheme(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

export default async function Header04({ storeInfo, theme: initialTheme }: { storeInfo?: any; theme?: any }) {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  const info = storeInfo || await getStoreInfo(tenantSlug);
  const theme = initialTheme || await getTheme(tenantSlug);

  const language = theme?.language || 'en';
  const t = (key: any) => getTranslation(language, key);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Top thin bar */}
      <div className="bg-gray-900 text-white text-center text-xs py-2 px-4 tracking-widest font-medium">
        Free shipping on orders over {theme?.currencySymbol || '৳'}{' '}999 &nbsp;|&nbsp; <Link prefetch={false} href="/products" className="hover:underline">{t('allProducts') || 'All Products'}</Link>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link prefetch={false} href="/" className="flex items-center gap-3 shrink-0">
            {info?.logo ? (
              <img src={info.logo} alt={info?.name || 'Store'} className="w-10 h-10 rounded-full object-contain border border-gray-100" />
            ) : null}
            <h1 className="text-xl font-black tracking-tight text-gray-900 uppercase">
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
