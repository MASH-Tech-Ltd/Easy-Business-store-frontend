import { getStoreInfo, getTheme } from '@/core/api/store';
import { getProducts, getBestsellingProducts, getNewArrivalsProducts } from '@/core/api/product';
import { getCategories } from '@/core/api/category';
import Link from 'next/link';
import Header04 from './components/layout/Header';
import Footer04 from './components/layout/Footer';
import ProductCard04 from './components/ui/ProductCard';
import HeroBannerSlider04 from './components/ui/HeroBannerSlider';
import { getTranslation } from '@/utils/translations';

export default async function Design04Home({ tenantSlug }: { tenantSlug: string }) {
  if (tenantSlug === 'main') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-4xl font-black text-gray-900">Welcome</h1>
      </div>
    );
  }

  const [products, bestsellers, newArrivals, categories, storeInfo, theme] = await Promise.all([
    getProducts(tenantSlug, 'limit=20&sort=random'),
    getBestsellingProducts(tenantSlug, 8),
    getNewArrivalsProducts(tenantSlug, 8),
    getCategories(tenantSlug),
    getStoreInfo(tenantSlug),
    getTheme(tenantSlug)
  ]);

  const displayCategories = (categories || []).slice(0, 7);
  const displayBestsellers = (bestsellers || []).slice(0, 8);
  const displayNewArrivals = (newArrivals || []).slice(0, 8);

  const language = storeInfo?.language || 'en';
  const t = (key: any) => getTranslation(language, key);

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header04 storeInfo={storeInfo} />

      {/* ── HERO ──────────────────────────────────── */}
      <HeroBannerSlider04 
        banner={theme?.banner} 
        featuredProductImage={products?.[0]?.images?.[0]?.secure_url} 
      />

      {/* ── CATEGORIES ────────────────────────────── */}
      {displayCategories.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 py-8 lg:py-14 w-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('categories') || 'Categories'}</h2>
            <Link prefetch={false} href="/categories" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">View all →</Link>
          </div>
          {/* Masonry-style grid matching screenshot layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
            {displayCategories.map((cat: any, idx: number) => (
              <Link prefetch={false}
                key={cat._id}
                href={`/category/${cat.slug || cat._id}`}
                className={`group relative rounded-xl sm:rounded-2xl overflow-hidden bg-gray-50 hover:shadow-md transition-all duration-300 block ${
                  idx === 0 ? 'row-span-2 h-[200px] sm:h-[316px]' : 'h-[96px] sm:h-[150px]'
                }`}
              >
                {cat.image?.secure_url ? (
                  <img
                    src={cat.image.secure_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 absolute inset-0">
                    <span className="text-gray-300 text-xs sm:text-sm">No image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h3 className="text-white font-bold text-xs sm:text-sm leading-tight">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── BESTSELLERS ──────────────────────────── */}
      {displayBestsellers.length > 0 && (
        <section className="bg-gray-50 py-8 sm:py-14">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="text-center mb-6 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-1 sm:mb-2">Best Sellers</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Our most popular products this season</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
              {displayBestsellers.map((product: any) => (
                <ProductCard04 key={product._id || product.id} product={product} isBestSelling={true} theme={theme} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── NEW ARRIVALS ────────────────────────── */}
      {displayNewArrivals.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 py-8 sm:py-14 w-full">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">New Arrivals</h2>
            <Link prefetch={false} href="/categories" className="text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {displayNewArrivals.map((product: any) => (
              <ProductCard04 key={product._id || product.id} product={product} theme={theme} />
            ))}
          </div>
        </section>
      )}

      {/* ── ALL PRODUCTS ────────────────────────── */}
      {products && products.length > 0 && (
        <section className="bg-gray-50 py-14">
          <div className="max-w-[1400px] mx-auto px-6 w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Discover More Products</h2>
              <Link prefetch={false} href="/products" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">View all →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {products.map((product: any) => (
                <ProductCard04 key={product._id || product.id} product={product} theme={theme} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link prefetch={false} href="/products" className="inline-block border-2 border-gray-900 text-gray-900 font-semibold px-10 py-3 rounded-full hover:bg-gray-900 hover:text-white transition-all">
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer04 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
