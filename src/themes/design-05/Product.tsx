import { storefrontFetch } from "../../utils/storefrontFetch";
import { headers } from 'next/headers';
import Link from 'next/link';
import ProductClient05 from './components/ui/ProductClient05';
import Header05 from './components/layout/Header';
import Footer05 from './components/layout/Footer';
import { getTranslation } from '@/utils/translations';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    return res.ok ? (await res.json()).data : null;
  } catch { return null; }
}

async function getProduct(tenantSlug: string, productSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products/${productSlug}`, { next: { revalidate: 60 } });
    return res.ok ? (await res.json()).data : null;
  } catch { return null; }
}

async function getTheme(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 60 } });
    return res.ok ? (await res.json()).data : null;
  } catch { return null; }
}

export default async function ProductPage05({ tenantSlug, params }: { tenantSlug: string, params: Promise<{ slug: string }> | { slug: string } }) {

  const resolvedParams = await params;

  const [storeInfo, product, theme] = await Promise.all([
    getStoreInfo(tenantSlug),
    getProduct(tenantSlug, resolvedParams.slug),
    getTheme(tenantSlug)
  ]);
  const language = storeInfo?.language || "en";
  const t = (key: any) => getTranslation(language || 'en', key);


  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header05 storeInfo={storeInfo} />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('productNotFound') || 'Product not found'}</h2>
          <p className="text-gray-500 mb-8 max-w-md">The product you are looking for does not exist or has been removed.</p>
          <Link href="/products" className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors">
            Back to Shop
          </Link>
        </div>
        <Footer05 storeInfo={storeInfo} theme={theme} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header05 storeInfo={storeInfo} />
      <ProductClient05 product={product} theme={theme} />
      <Footer05 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
