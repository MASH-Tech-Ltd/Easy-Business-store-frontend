import { headers } from 'next/headers';
import Link from 'next/link';
import ProductClient05 from './components/ui/ProductClient05';
import Header05 from './components/layout/Header';
import Footer05 from './components/layout/Footer';
import { getTranslation } from '@/utils/translations';
import { getStoreInfo, getTheme } from "@/core/api/store";
import { getProductBySlug } from "@/core/api/product";

export default async function ProductPage05({ tenantSlug, params }: { tenantSlug: string, params: Promise<{ slug: string }> | { slug: string } }) {

  const resolvedParams = await params;

  const [storeInfo, product, theme] = await Promise.all([
    getStoreInfo(tenantSlug),
    getProductBySlug(tenantSlug, resolvedParams.slug),
    getTheme(tenantSlug)
  ]);
  const language = theme?.language || "en";
  const t = (key: any) => getTranslation(language || 'en', key);


  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header05 storeInfo={storeInfo} />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('productNotFound') || 'Product not found'}</h2>
          <p className="text-gray-500 mb-8 max-w-md">The product you are looking for does not exist or has been removed.</p>
          <Link prefetch={false} href="/products" className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors">
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
