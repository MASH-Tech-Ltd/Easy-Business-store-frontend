import { storefrontFetch } from "../../utils/storefrontFetch";
import React from 'react';
import { headers } from 'next/headers';
import CheckoutClient from './CheckoutClient';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';

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

export default async function CheckoutPage() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  const [storeInfo, theme] = await Promise.all([
    getStoreInfo(tenantSlug),
    getTheme(tenantSlug),
  ]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <Header />
      <CheckoutClient storeInfo={storeInfo} theme={theme} />
      <Footer />
    </div>
  );
}

