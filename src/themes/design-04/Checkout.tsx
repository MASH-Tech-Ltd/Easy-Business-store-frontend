import { storefrontFetch } from "../../utils/storefrontFetch";
import React from 'react';
import { headers } from 'next/headers';
import CheckoutClient04 from './CheckoutClient';
import Footer04 from './components/layout/Footer';
import Header04 from './components/layout/Header';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

export default async function CheckoutPage04() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  const storeInfo = await getStoreInfo(tenantSlug);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header04 storeInfo={storeInfo} />
      <CheckoutClient04 storeInfo={storeInfo} theme={theme} />
      <Footer04 storeInfo={storeInfo} />
    </div>
  );
}
