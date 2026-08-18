import React from 'react';
import { headers } from 'next/headers';
import CheckoutClient from './CheckoutClient';
import Footer from '../../components/layout/Footer';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await fetch(`http://localhost:8000/api/v1/storefront/${tenantSlug}/info`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

export default async function CheckoutPage() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  const storeInfo = await getStoreInfo(tenantSlug);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <CheckoutClient storeInfo={storeInfo} />
      <Footer />
    </div>
  );
}
