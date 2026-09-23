import { storefrontFetch } from "../../../../utils/storefrontFetch";
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import HeaderCartIcon05 from '../ui/HeaderCartIcon';
import GlobalSearch05 from '../ui/GlobalSearch';
import { getTranslation } from '@/utils/translations';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

export default async function Header05({ storeInfo }: { storeInfo?: any }) {
  const language = storeInfo?.language || "en";
  const t = (key: any) => getTranslation(language || 'en', key);


  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  const info = storeInfo || await getStoreInfo(tenantSlug);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-8 h-12">
          {/* Brand */}
          <Link prefetch={false} href="/" className="flex items-center gap-3 shrink-0 group">
            {info?.logo ? (
              <img src={info.logo} alt={info?.name || 'Store'} className="w-10 h-10 rounded-xl object-contain border border-gray-100 group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="font-bold text-gray-400 text-xs">IMG</span>
              </div>
            )}
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              {info?.name || tenantSlug}
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-500">
            <Link prefetch={false} href="/" className="hover:text-black transition-colors">Discover</Link>
            <Link prefetch={false} href="/products" className="hover:text-black transition-colors">Collection</Link>
            <Link prefetch={false} href="/categories" className="hover:text-black transition-colors">{t('categories') || 'Categories'}</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <div className="hidden lg:block w-72">
              <GlobalSearch05 tenantSlug={tenantSlug} />
            </div>
            <div className="w-px h-6 bg-gray-200 hidden md:block"></div>
            <HeaderCartIcon05 />
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="block lg:hidden w-full">
          <GlobalSearch05 tenantSlug={tenantSlug} />
        </div>
      </div>
    </header>
  );
}
