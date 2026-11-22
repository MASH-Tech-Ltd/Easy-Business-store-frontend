import React from 'react';
import Link from 'next/link';
import { getCategoryCardImageUrl } from '@/utils/imageOptimizer';
import { getStoreInfo, getTheme } from '@/core/api/store';
import { getProducts, getBestsellingProducts, getNewArrivalsProducts } from '@/core/api/product';
import { getCategories } from '@/core/api/category';
import Header06 from './components/layout/Header';
import Footer06 from './components/layout/Footer';
import ProductCard06 from './components/ui/ProductCard';
import HeroBannerSlider06 from './components/ui/HeroBannerSlider';
import { ArrowRight } from 'lucide-react';

export default async function Design06Home({
  tenantSlug,
}: {
  tenantSlug: string;
}) {
  const [products, bestsellers, newArrivals, categories, storeInfo, theme] =
    await Promise.all([
      getProducts(tenantSlug, 'limit=25&sort=random'),
      getBestsellingProducts(tenantSlug, 10),
      getNewArrivalsProducts(tenantSlug, 10),
      getCategories(tenantSlug),
      getStoreInfo(tenantSlug),
      getTheme(tenantSlug),
    ]);

  const isBn = theme?.language === 'bn';

  if (tenantSlug === 'main') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <h1 className="font-heading text-4xl font-bold text-gray-900 tracking-tight">
          {isBn ? 'অনলাইন স্টোরে স্বাগতম' : 'Welcome to Online Store'}
        </h1>
      </div>
    );
  }

  const displayCategories = categories && categories.length > 0 ? categories.slice(0, 6) : [];
  const displayBestsellers = (bestsellers || []).slice(0, 10);
  const displayNewArrivals = (newArrivals || []).slice(0, 10);
  const displayProducts = (products || []).slice(0, 10);

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col text-gray-900 selection:bg-black selection:text-white">
      {/* Header with Top Announcement Bar */}
      <Header06 storeInfo={storeInfo} />

      <main className="flex-1">
        {/* 1. Hero Section Slider */}
        <HeroBannerSlider06 banner={theme?.banner} />

        {/* 2. Category Section (Only shown if store has categories) */}
        {displayCategories.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-12 py-10 lg:py-16 max-w-[1400px] mx-auto w-full">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">
                {isBn ? 'ক্যাটাগরি সমূহ' : 'Category Section'}
              </h2>
              <Link
                prefetch={false}
                href="/categories"
                className="bg-[#0f172a] hover:bg-black text-white text-xs sm:text-sm font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all duration-300 shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <span>{isBn ? 'আরও দেখুন' : 'See more'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Category Cards Grid (3 on mobile, 6 on desktop - compact & neat) */}
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 lg:gap-5">
              {displayCategories.map((c: any) => {
                const img = c.image?.secure_url || c.image?.url || c.image;
                const linkHref = `/category/${encodeURIComponent(c.slug || c._id)}`;
                return (
                  <Link
                    prefetch={false}
                    key={c._id}
                    href={linkHref}
                    className="group relative aspect-[4/5] sm:aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden flex flex-col justify-end p-1.5 sm:p-3 border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-500 bg-gray-50 cursor-default"
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0 bg-gray-100 overflow-hidden">
                      {img ? (
                        <img
                          src={getCategoryCardImageUrl(img)}
                          alt={c.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] sm:text-xs font-bold uppercase">
                          {isBn ? 'কোন ছবি নেই' : 'No Image'}
                        </div>
                      )}
                    </div>

                    {/* Subtle Gradient Shadow for card readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                    {/* Floating pill capsule at bottom */}
                    <div className="relative z-10 w-full flex justify-center">
                      <span className="w-full bg-white/95 backdrop-blur-md text-gray-900 text-[10px] sm:text-sm font-semibold py-1 sm:py-2 px-1 sm:px-3.5 rounded-lg sm:rounded-xl shadow-md text-center border border-white/60 group-hover:bg-black group-hover:text-white transition-all duration-300 truncate block cursor-pointer">
                        {c.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. Featured Product Section (5 per row on desktop) */}
        <section className="px-4 sm:px-6 lg:px-12 py-10 lg:py-16 max-w-[1400px] mx-auto w-full">
          {/* Centered Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              {isBn ? 'বিশেষ পণ্যসমূহ' : 'Featured Product'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
              {isBn ? 'সেরা অফারে দারুণ সব পণ্য' : 'Great product with great deal'}
            </p>
          </div>

          {/* Product Cards Grid - 5 per row on desktop */}
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {displayProducts.map((p: any) => (
                <ProductCard06
                  key={p._id}
                  product={p}
                  theme={theme}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl p-6">
              <p className="text-gray-500 text-sm">
                {isBn ? 'কোনো পণ্য পাওয়া যায়নি।' : 'No featured products found yet.'}
              </p>
            </div>
          )}
        </section>

        {/* 4. Deals & Bestsellers Collection (5 per row on desktop) */}
        {displayBestsellers.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-12 py-12 lg:py-16 max-w-[1400px] mx-auto w-full border-t border-gray-100">
            <div className="flex items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-amber-600 block mb-0.5 sm:mb-1">
                  {isBn ? 'গ্রাহকদের পছন্দ' : 'Customer Favorites'}
                </span>
                <h3 className="font-heading text-xl sm:text-3xl font-bold tracking-tight text-gray-900">
                  {isBn ? 'সেরা বিক্রিত কালেকশন' : 'Best Selling Collection'}
                </h3>
              </div>
              <Link
                prefetch={false}
                href="/products?sort=sales"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-700 hover:text-black border-b border-black pb-0.5 shrink-0 cursor-pointer"
              >
                <span>{isBn ? 'সব দেখুন' : 'View All'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {displayBestsellers.map((p: any) => (
                <ProductCard06
                  key={p._id}
                  product={p}
                  isBestSelling={true}
                  theme={theme}
                />
              ))}
            </div>
          </section>
        )}

        {/* 5. Latest Collection (New Arrivals - 5 per row on desktop) */}
        {displayNewArrivals.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-12 py-12 lg:py-16 max-w-[1400px] mx-auto w-full">
            <div className="flex items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5 sm:mb-1">
                  {isBn ? 'নতুন আগমন' : 'Just In'}
                </span>
                <h3 className="font-heading text-xl sm:text-3xl font-bold tracking-tight text-gray-900">
                  {isBn ? 'লেটেস্ট কালেকশন' : 'Latest Arrivals'}
                </h3>
              </div>
              <Link
                prefetch={false}
                href="/products?sort=newest"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-700 hover:text-black border-b border-black pb-0.5 shrink-0 cursor-pointer"
              >
                <span>{isBn ? 'সব দেখুন' : 'View All'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {displayNewArrivals.map((p: any) => (
                <ProductCard06
                  key={p._id}
                  product={p}
                  theme={theme}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer06 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
