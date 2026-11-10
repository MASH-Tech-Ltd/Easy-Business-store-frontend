import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductClient05 from './components/ui/ProductClient05';
import Header05 from './components/layout/Header';
import Footer05 from './components/layout/Footer';
import { getTranslation } from '@/utils/translations';
import { getStoreInfo, getTheme } from "@/core/api/store";
import { getProductBySlug } from "@/core/api/product";

export default async function ProductPage05({
  tenantSlug,
  params,
  initialProduct,
  initialStoreInfo,
  initialTheme,
}: {
  tenantSlug: string;
  params: Promise<{ slug: string }> | { slug: string };
  initialProduct?: any;
  initialStoreInfo?: any;
  initialTheme?: any;
}) {

  const resolvedParams = await params;

  const [storeInfo, product, theme] = await Promise.all([
    initialStoreInfo !== undefined ? initialStoreInfo : getStoreInfo(tenantSlug),
    initialProduct !== undefined ? initialProduct : getProductBySlug(tenantSlug, resolvedParams.slug),
    initialTheme !== undefined ? initialTheme : getTheme(tenantSlug),
  ]);
  const language = theme?.language || "en";
  const t = (key: any) => getTranslation(language || 'en', key);


  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header05 storeInfo={storeInfo} />
      <ProductClient05 product={product} theme={theme} />
      <Footer05 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
