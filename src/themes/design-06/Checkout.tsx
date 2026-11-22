import { storefrontFetch } from '../../utils/storefrontFetch';
import React from 'react';
import CheckoutClient06 from './components/ui/CheckoutClient06';
import Header06 from './components/layout/Header';
import Footer06 from './components/layout/Footer';
import { headers } from 'next/headers';

export default async function Checkout06({ tenantSlug: propTenantSlug }: { tenantSlug?: string } = {}) {
  const headersList = await headers();
  const tenantSlug = propTenantSlug || headersList.get('x-tenant-slug') || 'main';

  const [storeInfoRes, themeRes] = await Promise.all([
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } }),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 60 } }),
  ]);

  const storeInfo = storeInfoRes.ok ? (await storeInfoRes.json()).data : null;
  const theme = themeRes.ok ? (await themeRes.json()).data : null;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col text-gray-900">
      <Header06 storeInfo={storeInfo} />
      <CheckoutClient06 theme={theme} storeInfo={storeInfo} />
      <Footer06 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
