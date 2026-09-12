import { getStoreInfo, getTheme } from '@/core/api/store';
import { getProducts, getBestsellingProducts, getJustForYouProducts } from '@/core/api/product';
import { getCategories } from '@/core/api/category';
import Link from 'next/link';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Design02ProductCard from './components/ui/ProductCard';

export default async function Design02Home({ tenantSlug }: { tenantSlug: string }) {
  if (tenantSlug === 'main') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <h1 className="text-3xl font-light">Platform Landing Page</h1>
      </div>
    );
  }

  const [products, bestsellers, featured, categories, storeInfo, theme] = await Promise.all([
    getProducts(tenantSlug),
    getBestsellingProducts(tenantSlug, 8),
    getJustForYouProducts(tenantSlug, 8),
    getCategories(tenantSlug),
    getStoreInfo(tenantSlug),
    getTheme(tenantSlug)
  ]);

  const displayCategories = categories?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      {/* Proper Navbar */}
      <Header storeInfo={storeInfo} />

      {/* Hero Section */}
      <section className="relative py-16 md:py-20 flex flex-col justify-center min-h-[100px] lg:min-h-[150px] overflow-hidden">
        {theme?.banner?.image?.secure_url ? (
          <div className="absolute inset-0 z-0">
            <img 
              src={theme.banner.image.secure_url} 
              alt={theme.banner.title || 'Banner'} 
              className="w-full h-full object-cover object-center" 
            />
            {/* Elegant white gradient fading to transparent for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gray-50"></div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-8">
          <div className="max-w-2xl text-left">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-gray-900 leading-[1.1] whitespace-pre-line">
              {theme?.banner?.title || 'Simplicity is the \n ultimate sophistication.'}
            </h2>
            <p className="text-gray-600 mb-10 max-w-xl text-lg md:text-xl font-medium">
              {theme?.banner?.subtitle || 'Discover our curated collection of premium products designed for modern living.'}
            </p>
            <Link href={theme?.banner?.buttonLink || '/categories'} className="inline-block px-10 py-4 bg-gray-900 text-white rounded-full text-sm font-bold tracking-wide hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 duration-300">
              {theme?.banner?.buttonText || 'Shop Collection'}
            </Link>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-16 space-y-24">
        
        {/* Category List */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <h3 className="text-2xl font-semibold tracking-tight">Shop by Category</h3>
            <Link href="/categories" className="text-sm font-medium text-gray-500 hover:text-gray-900">View All Categories &rarr;</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {displayCategories.map((category: any) => (
              <Link 
                key={category._id} 
                href={`/category/${category.slug || category._id}`}
                className="group flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform overflow-hidden">
                  {category.image?.secure_url ? (
                    <img src={category.image.secure_url} alt={category.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-center text-gray-900 group-hover:text-black">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Bestselling Products */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b border-gray-100 pb-4">
            <h3 className="text-3xl font-light tracking-tight text-gray-900">Bestselling</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {bestsellers.map((product: any) => (
              <Design02ProductCard key={product._id || product.id} product={product} isBestSelling={true} theme={theme} />
            ))}
          </div>
        </section>

        {/* Random / Featured Products */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b border-gray-100 pb-4">
            <h3 className="text-3xl font-light tracking-tight text-gray-900">Just For You</h3>
            <Link href="/categories" className="text-sm font-medium text-gray-500 hover:text-gray-900">Shop All &rarr;</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {featured.map((product: any) => (
              <Design02ProductCard key={product._id || product.id} product={product} theme={theme} />
            ))}
          </div>
        </section>

      </main>

      <section className="py-16 bg-white border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-end justify-between mb-8 pb-4">
            <h3 className="text-3xl font-light tracking-tight text-gray-900">Discover More</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product: any) => (
              <Design02ProductCard key={product._id || product.id} product={product} theme={theme} />
            ))}
          </div>
        </div>
      </section>

      <Footer storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
