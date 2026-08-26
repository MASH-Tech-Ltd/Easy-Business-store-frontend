import { headers } from 'next/headers';
import Link from 'next/link';
import { getStoreInfo, getTheme } from '@/core/api/store';
import Design02CheckoutClient from './CheckoutClient';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

export default async function Design02CheckoutPage({ tenantSlug }: { tenantSlug: string }) {
  const [storeInfo, theme] = await Promise.all([
    getStoreInfo(tenantSlug),
    getTheme(tenantSlug)
  ]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <Header storeInfo={storeInfo} />

      <Design02CheckoutClient storeInfo={storeInfo} />

      <Footer storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
