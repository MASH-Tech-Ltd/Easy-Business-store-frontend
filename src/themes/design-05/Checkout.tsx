import { storefrontFetch } from "../../utils/storefrontFetch";
import React from 'react';
import CheckoutClient05 from './components/ui/CheckoutClient05';
import Header05 from './components/layout/Header';
import Footer05 from './components/layout/Footer';
import { headers } from 'next/headers';

export default async function Checkout05() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [storeInfoRes, themeRes] = await Promise.all([
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } }),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 60 } })
  ]);
  
  const storeInfo = storeInfoRes.ok ? (await storeInfoRes.json()).data : null;
  const theme = themeRes.ok ? (await themeRes.json()).data : null;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header05 storeInfo={storeInfo} />
      <CheckoutClient05 theme={theme} storeInfo={storeInfo} />
      <Footer05 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
