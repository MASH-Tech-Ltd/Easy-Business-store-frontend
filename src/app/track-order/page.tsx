import React, { Suspense } from 'react';
import { headers } from 'next/headers';
import { getTheme, getStoreInfo } from '@/core/api/store';
import { themeRegistry } from '@/themes/themeRegistry';
import { TrackOrderContent } from './TrackOrderClient';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  const storeInfo = await getStoreInfo(tenantSlug);
  const storeName = storeInfo?.name || tenantSlug.toUpperCase();
  return {
    title: `Track Your Order | ${storeName}`,
    description: `Track the status of your order at ${storeName}.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}


export default async function TrackOrderPage() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  
  let storeInfo = null;
  let themeInfo = null;
  let themeId = 'design-01';

  if (tenantSlug !== 'main') {
    const [info, theme] = await Promise.all([
      getStoreInfo(tenantSlug),
      getTheme(tenantSlug)
    ]);
    storeInfo = info;
    themeInfo = theme;
    if (theme && theme.themeId && themeRegistry[theme.themeId]) {
      themeId = theme.themeId;
    }
  }

  const Header = themeRegistry[themeId]?.Header || themeRegistry['design-01'].Header;
  const Footer = themeRegistry[themeId]?.Footer || themeRegistry['design-01'].Footer;

  if (themeId === 'design-03') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-cyan-500/30">
        <Header storeInfo={storeInfo} />
        <div className="flex flex-col flex-1">
          <Suspense fallback={<div className="flex-grow flex items-center justify-center lg:ml-64">Loading...</div>}>
            <div className="flex-grow lg:ml-64 min-h-screen bg-[#050505] border-l border-white/10">
              <TrackOrderContent tenantId={storeInfo?._id} />
            </div>
          </Suspense>
          <div className="lg:ml-64">
            <Footer storeInfo={storeInfo} theme={themeInfo} />
          </div>
        </div>
      </div>
    );
  }



  if (themeId === 'design-02') {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
        <Header storeInfo={storeInfo} />
        <Suspense fallback={<div className="flex-grow flex items-center justify-center">Loading...</div>}>
          <div className="flex-grow">
            <TrackOrderContent tenantId={storeInfo?._id} />
          </div>
        </Suspense>
        <Footer storeInfo={storeInfo} theme={themeInfo} />
      </div>
    );
  }

  // Default / design-01 / design-04
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Header storeInfo={storeInfo} />
      <Suspense fallback={<div className="flex-grow flex items-center justify-center">Loading...</div>}>
        <div className="flex-grow">
          <TrackOrderContent tenantId={storeInfo?._id} />
        </div>
      </Suspense>
      <Footer storeInfo={storeInfo} theme={themeInfo} />
    </div>
  );
}
