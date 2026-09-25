import { getStoreInfo, getTheme } from "@/core/api/store";
import {
  getProducts,
  getBestsellingProducts,
  getJustForYouProducts,
} from "@/core/api/product";
import { getCategories } from "@/core/api/category";
import Link from "next/link";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Design02ProductCard from "./components/ui/ProductCard";

export default async function Design02Home({
  tenantSlug,
}: {
  tenantSlug: string;
}) {
  if (tenantSlug === "main") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <h1 className="text-3xl font-light">Platform Landing Page</h1>
      </div>
    );
  }

  const [products, bestsellers, featured, categories, storeInfo, theme] =
    await Promise.all([
      getProducts(tenantSlug),
      getBestsellingProducts(tenantSlug, 8),
      getJustForYouProducts(tenantSlug, 8),
      getCategories(tenantSlug),
      getStoreInfo(tenantSlug),
      getTheme(tenantSlug),
    ]);

  const displayCategories = categories?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      {/* Proper Navbar */}
      <Header storeInfo={storeInfo} />

      {/* Hero Section */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto w-full relative overflow-hidden flex flex-col justify-center aspect-[21/9] max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] xl:max-h-[650px] sm:mt-4 sm:rounded-2xl shadow-sm">
          {theme?.banner?.image?.secure_url ? (
            <div className="absolute inset-0 z-0">
              <img
                src={theme.banner.image.secure_url}
                alt={theme.banner.title || "Banner"}
                className="w-full h-full object-cover object-center"
              />
              {/* Elegant white gradient fading to transparent for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-transparent"></div>
            </div>
          ) : (
            <div className="absolute inset-0 z-0 bg-gray-50"></div>
          )}
  
          <div className="relative z-10 flex flex-col justify-center pointer-events-none w-full h-full">
            <div className="w-full px-6 sm:px-12">
              <div className="max-w-2xl text-left pointer-events-auto py-8 lg:py-16">
                {theme?.banner?.title && (
                <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 sm:mb-4 text-white leading-[1.1] whitespace-pre-line">
                    {theme.banner.title}
                  </h2>
                )}
                {theme?.banner?.description && (
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white mb-4 sm:mb-8 max-w-xl font-medium line-clamp-2 sm:line-clamp-3">
                    {theme.banner.description}
                  </p>
                )}
                {theme?.banner?.buttonText && theme?.banner?.buttonLink && (
                  <Link
                    prefetch={false}
                    href={theme.banner.buttonLink}
                  className="inline-block px-6 sm:px-10 py-2.5 sm:py-4 bg-white text-gray-900 rounded-full text-xs sm:text-sm font-bold tracking-wide hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl  duration-300"
                  >
                    {theme.banner.buttonText}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-12 lg:py-16 space-y-6 sm:space-y-10 lg:space-y-20">
        {/* Category List */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <h3 className="text-2xl font-semibold tracking-tight">
              Shop by Category
            </h3>
            <Link
              prefetch={false}
              href="/categories"
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              View All Categories &rarr;
            </Link>
          </div>
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pb-4 -mx-4 px-4 sm:-mx-8 sm:px-8 md:mx-0 md:px-0 snap-x snap-mandatory hide-scrollbar">
            {displayCategories.map((category: any) => (
              <Link
                prefetch={false}
                key={category._id}
                href={`/category/${category.slug || category._id}`}
                className="group flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 min-w-[100px] sm:min-w-[120px] md:min-w-0 shrink-0 snap-start"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 sm:mb-3 md:mb-4 group-hover:scale-105 transition-transform overflow-hidden">
                  {category.image?.secure_url ? (
                    <img
                      src={category.image.secure_url}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 md:w-6 md:h-6 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-[11px] sm:text-xs md:text-sm font-medium text-center text-gray-900 group-hover:text-black line-clamp-1">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Bestselling Products */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b border-gray-100 pb-4">
            <h3 className="text-3xl font-light tracking-tight text-gray-900">
              Bestselling
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {bestsellers.map((product: any) => (
              <Design02ProductCard
                key={product._id || product.id}
                product={product}
                isBestSelling={true}
                theme={theme}
              />
            ))}
          </div>
        </section>

        {/* Random / Featured Products */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b border-gray-100 pb-4">
            <h3 className="text-3xl font-light tracking-tight text-gray-900">
              Just For You
            </h3>
            <Link
              prefetch={false}
              href="/categories"
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Shop All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {featured.map((product: any) => (
              <Design02ProductCard
                key={product._id || product.id}
                product={product}
                theme={theme}
              />
            ))}
          </div>
        </section>
      </main>

      <section className="py-16 bg-white border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-end justify-between mb-8 pb-4">
            <h3 className="text-3xl font-light tracking-tight text-gray-900">
              Discover More
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product: any) => (
              <Design02ProductCard
                key={product._id || product.id}
                product={product}
                theme={theme}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
