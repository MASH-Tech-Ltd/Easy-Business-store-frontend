import { getStoreInfo, getTheme } from '@/core/api/store';
import { getProducts, getBestsellingProducts } from '@/core/api/product';
import { getCategories } from '@/core/api/category';
import Link from 'next/link';
import Header04 from './components/layout/Header';
import Footer04 from './components/layout/Footer';
import ProductCard04 from './components/ui/ProductCard';
import { getTranslation } from '@/utils/translations';

export default async function Design04Home({ tenantSlug }: { tenantSlug: string }) {
  if (tenantSlug === 'main') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-4xl font-black text-gray-900">Welcome</h1>
      </div>
    );
  }

  const [products, bestsellers, categories, storeInfo, theme] = await Promise.all([
    getProducts(tenantSlug),
    getBestsellingProducts(tenantSlug, 8),
    getCategories(tenantSlug),
    getStoreInfo(tenantSlug),
    getTheme(tenantSlug)
  ]);

  const displayCategories = (categories || []).slice(0, 7);
  const displayBestsellers = (bestsellers || []).slice(0, 8);
  const displayProducts = (products || []).slice(0, 8);

  const language = storeInfo?.language || 'en';
  const t = (key: any) => getTranslation(language, key);

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header04 storeInfo={storeInfo} />

      {/* ── HERO ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gray-900 lg:bg-gray-100 aspect-[21/9] lg:aspect-auto flex flex-col justify-center">
        {/* Mobile & Tablet Background Image & Gradient (Visible only < lg) */}
        <div className="absolute inset-0 z-0 lg:hidden">
          {theme?.banner?.image?.secure_url ? (
            <>
              <img
                src={theme.banner.image.secure_url}
                alt={theme.banner.title || 'Banner'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30"></div>
            </>
          ) : (
            <div className="w-full h-full bg-gray-900"></div>
          )}
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-2 sm:py-4 lg:py-20 grid lg:grid-cols-2 gap-4 lg:gap-10 items-center">
          {/* Left: Text */}
          <div className="text-white lg:text-gray-900 flex flex-col justify-center h-full">
            {theme?.banner?.subtitle && (
              <p className="text-[10px] sm:text-xs lg:text-sm font-semibold tracking-widest uppercase mb-1 lg:mb-3 text-gray-300 lg:text-gray-400">
                {theme.banner.subtitle}
              </p>
            )}
            {theme?.banner?.title && (
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-1 sm:mb-2 lg:mb-5">
                {theme.banner.title}
              </h2>
            )}
            {theme?.banner?.description && (
              <p className="text-xs sm:text-sm md:text-lg mb-2 sm:mb-4 lg:mb-8 max-w-md leading-snug lg:leading-relaxed text-gray-200 lg:text-gray-400 line-clamp-1 sm:line-clamp-2 lg:line-clamp-none">
                {theme.banner.description}
              </p>
            )}
            {theme?.banner?.buttonText && theme?.banner?.buttonLink && (
              <div>
                <Link prefetch={false}
                  href={theme.banner.buttonLink}
                  className="inline-block font-bold px-6 py-2 sm:px-6 sm:py-2.5 md:px-10 md:py-4 rounded-full transition-colors shadow-xl lg:shadow-none bg-white text-gray-900 hover:bg-gray-100 lg:bg-gray-900 lg:text-white lg:hover:bg-gray-700 text-xs sm:text-sm md:text-base"
                >
                  {theme.banner.buttonText}
                </Link>
              </div>
            )}
          </div>

          {/* Right: Hero Image (Visible only >= lg) */}
          <div className="hidden lg:flex relative justify-center items-center">
            <div className="w-full max-h-[480px] aspect-square bg-gray-50 rounded-3xl overflow-hidden flex items-center justify-center">
              {theme?.banner?.image?.secure_url ? (
                <img
                  src={theme.banner.image.secure_url}
                  alt={theme.banner.title || 'Banner'}
                  className="w-full h-full object-cover"
                />
              ) : products?.[0]?.images?.[0]?.secure_url ? (
                <img
                  src={products[0].images[0].secure_url}
                  alt="Featured product"
                  className="w-full h-full object-cover p-8"
                />
              ) : (
                <div className="text-gray-200 text-sm">No image</div>
              )}
            </div>
          </div>
        </div>
      </section>

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
      {displayProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 py-8 sm:py-14 w-full">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">New Arrivals</h2>
            <Link prefetch={false} href="/categories" className="text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {displayProducts.map((product: any) => (
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
