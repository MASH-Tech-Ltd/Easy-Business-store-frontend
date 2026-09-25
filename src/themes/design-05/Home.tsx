import { getStoreInfo, getTheme } from "@/core/api/store";
import { getProducts, getBestsellingProducts } from "@/core/api/product";
import { getCategories } from "@/core/api/category";
import Link from "next/link";
import Header05 from "./components/layout/Header";
import Footer05 from "./components/layout/Footer";
import ProductCard05 from "./components/ui/ProductCard";

export default async function Design05Home({
  tenantSlug,
}: {
  tenantSlug: string;
}) {
  if (tenantSlug === "main") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Welcome to Minimal
        </h1>
      </div>
    );
  }

  const [products, bestsellers, categories, storeInfo, theme] =
    await Promise.all([
      getProducts(tenantSlug),
      getBestsellingProducts(tenantSlug, 8),
      getCategories(tenantSlug),
      getStoreInfo(tenantSlug),
      getTheme(tenantSlug),
    ]);

  const displayCategories = (categories || []).slice(0, 6);
  const displayBestsellers = (bestsellers || []).slice(0, 8);
  const displayProducts = (products || []).slice(0, 8);

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col text-gray-900">
      <Header05 storeInfo={storeInfo} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full px-4 sm:px-6 lg:px-12 py-4 lg:py-6 max-w-[1400px] mx-auto">
          <div className="bg-[#F8F9FA] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden flex flex-col-reverse lg:flex-row items-center justify-between p-4 sm:p-6 lg:p-10 relative">
            <div className="lg:w-1/2 z-10 relative text-center lg:text-left mt-4 lg:mt-0 w-full">
              {theme?.banner?.title && (
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.1] mb-3 sm:mb-5">
                  {theme.banner.title}
                </h2>
              )}
              {theme?.banner?.description && (
                <p className="text-gray-500 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                  {theme.banner.description}
                </p>
              )}
              {theme?.banner?.buttonText && theme?.banner?.buttonLink && (
                <Link prefetch={false}
                  href={theme.banner.buttonLink}
                  className="inline-flex items-center justify-center bg-black text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors gap-2 group"
                >
                  {theme.banner.buttonText}
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>

            <div className="lg:w-1/2 relative flex justify-center aspect-[21/9] w-full mb-2 lg:mb-0">
              {theme?.banner?.image ? (
                <img
                  src={theme.banner.image?.secure_url || theme.banner.image}
                  alt="Hero"
                  className="w-full h-full object-cover rounded-2xl sm:rounded-3xl drop-shadow-2xl z-10 relative"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-10">
                  <svg
                    className="w-64 h-64"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {/* Decorative circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-gray-200/50 to-transparent rounded-full blur-3xl -z-0"></div>
            </div>
          </div>
        </section>

        {/* Categories */}
        {displayCategories.length > 0 && (
          <section className="px-6 lg:px-12 py-8 max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">
                  Shop by Category
                </h3>
                <p className="text-gray-500">
                  Curated selections for your lifestyle
                </p>
              </div>
              <Link prefetch={false}
                href="/categories"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-black transition-colors border border-gray-200 hover:border-black rounded-full px-4 py-1.5"
              >
                View All
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>

            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {displayCategories.map((c: any) => (
                <Link prefetch={false}
                  key={c._id}
                  href={`/category/${c.slug || c._id}`}
                  className="w-full group relative aspect-[4/4] sm:aspect-square rounded-[1.2rem] sm:rounded-[1.5rem] overflow-hidden flex flex-col justify-end p-3 lg:p-5 border border-transparent transition-all shadow-sm hover:shadow-xl"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 bg-[#F8F9FA]">
                    {c.image && (
                      <img
                        src={c.image?.secure_url || c.image}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    )}
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>

                  {/* Content */}
                  <div className="relative z-10 flex justify-between items-end w-full">
                    <span className="font-bold text-lg text-white tracking-tight group-hover:translate-x-1 transition-transform duration-300 line-clamp-1">
                      {c.name}
                    </span>
                    {/* <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-colors text-white duration-300 ml-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div> */}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bestsellers */}
        {displayBestsellers.length > 0 && (
          <section className="px-6 lg:px-12 py-8 lg:py-20 max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">
                  Most Wanted
                </h3>
                <p className="text-gray-500">Our highest rated products</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayBestsellers.map((p: any) => (
                <ProductCard05 key={p._id} product={p} isBestSelling={true} theme={theme} />
              ))}
            </div>
          </section>
        )}

        {/* Banner Section */}
        <section className="hidden px-6 lg:px-12 py-10 max-w-[1400px] mx-auto">
          <div className="bg-black text-white rounded-[2rem] p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-20 pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6 block">
                Newsletter
              </span>
              <h3 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                Join the Minimalist Movement
              </h3>
              <p className="text-gray-400 text-lg mb-10">
                Subscribe to get early access to new collections and exclusive
                offers.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* All Products */}
        {displayProducts.length > 0 && (
          <section className="px-6 lg:px-12 py-20 max-w-[1400px] mx-auto border-t border-gray-100/50">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">
                  Latest Collection
                </h3>
                <p className="text-gray-500">Fresh arrivals this week</p>
              </div>
              <Link prefetch={false}
                href="/products"
                className="text-sm font-semibold uppercase tracking-widest text-gray-400 hover:text-black transition-colors hidden sm:block"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
              {displayProducts.map((p: any) => (
                <ProductCard05 key={p._id} product={p} theme={theme} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link prefetch={false}
                href="/products"
                className="inline-block border border-gray-200 text-gray-900 font-semibold px-10 py-4 rounded-full hover:border-black hover:bg-black hover:text-white transition-all"
              >
                View Entire Collection
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer05 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
