import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import ProductClient06 from './components/ui/ProductClient06';
import Header06 from './components/layout/Header';
import Footer06 from './components/layout/Footer';
import { getStoreInfo, getTheme } from '@/core/api/store';
import { getProductBySlug, getProducts } from '@/core/api/product';

export default async function ProductPage06({
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

  if (!product) {
    notFound();
  }

  // Fetch related products dynamically from the same category
  let relatedProducts: any[] = [];
  const categoryId =
    product.categoryId?._id ||
    product.categoryId ||
    product.category?._id ||
    product.category;

  if (categoryId) {
    try {
      const res: any = await getProducts(tenantSlug, `categoryId=${categoryId}&limit=6`);
      const list = Array.isArray(res) ? res : [];
      relatedProducts = list
        .filter((p: any) => (p._id || p.id) !== (product._id || product.id))
        .slice(0, 5);
    } catch {}
  }

  if (relatedProducts.length === 0) {
    try {
      const res: any = await getProducts(tenantSlug, `limit=6&sort=random`);
      const list = Array.isArray(res) ? res : [];
      relatedProducts = list
        .filter((p: any) => (p._id || p.id) !== (product._id || product.id))
        .slice(0, 5);
    } catch {}
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
      <Header06 storeInfo={storeInfo} />
      <ProductClient06
        product={product}
        theme={theme}
        storeInfo={storeInfo}
        relatedProducts={relatedProducts}
      />
      <Footer06 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
