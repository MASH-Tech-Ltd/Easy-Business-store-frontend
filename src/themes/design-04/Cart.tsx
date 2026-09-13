import React from 'react';
import CartClient04 from './CartClient';
import Footer04 from './components/layout/Footer';
import Header04 from './components/layout/Header';
import { getStoreInfo, getTheme } from '@/core/api/store';

export default async function CartPage04({ tenantSlug }: { tenantSlug: string }) {
  const [storeInfo, theme] = await Promise.all([
    getStoreInfo(tenantSlug),
    getTheme(tenantSlug)
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header04 storeInfo={storeInfo} />
      <CartClient04 theme={theme} storeInfo={storeInfo} />
      <Footer04 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
