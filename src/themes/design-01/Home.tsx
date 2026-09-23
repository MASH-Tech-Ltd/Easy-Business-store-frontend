import { headers } from 'next/headers';
import Link from 'next/link';
import { Laptop, Cpu, Smartphone, Speaker, Wind, Tv, Gamepad2, Printer, Camera, Component, ArrowRight } from 'lucide-react';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import CategorySlider from './components/ui/CategorySlider';
import ProductCard from './components/ui/ProductCard';
import { getTranslation, TranslationKeys } from '@/utils/translations';
import { getStoreInfo, getTheme } from '@/core/api/store';
import { getProducts } from '@/core/api/product';
import { getCategories } from '@/core/api/category';

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('laptop') || n.includes('computer') || n.includes('pc')) return <Laptop className="w-8 h-8" />;
  if (n.includes('processor') || n.includes('cpu') || n.includes('chip')) return <Cpu className="w-8 h-8" />;
  if (n.includes('mobile') || n.includes('phone') || n.includes('smartphone')) return <Smartphone className="w-8 h-8" />;
  if (n.includes('speaker') || n.includes('audio') || n.includes('sound')) return <Speaker className="w-8 h-8" />;
  if (n.includes('ac') || n.includes('air') || n.includes('cooling')) return <Wind className="w-8 h-8" />;
  if (n.includes('tv') || n.includes('television') || n.includes('display')) return <Tv className="w-8 h-8" />;
  if (n.includes('game') || n.includes('gaming') || n.includes('console')) return <Gamepad2 className="w-8 h-8" />;
  if (n.includes('print') || n.includes('printer')) return <Printer className="w-8 h-8" />;
  if (n.includes('camera') || n.includes('photo') || n.includes('lens')) return <Camera className="w-8 h-8" />;
  return <Component className="w-8 h-8" />;
};

export default async function Design01Home({ tenantSlug }: { tenantSlug: string }) {
  if (tenantSlug === 'main') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Platform Landing Page</h1>
          <p className="text-gray-500">Welcome to the multi-tenant SaaS. Access your store via subdomain.</p>
        </div>
      </div>
    );
  }

  const [products, categories, storeInfo, theme] = await Promise.all([
    getProducts(tenantSlug),
    getCategories(tenantSlug),
    getStoreInfo(tenantSlug),
    getTheme(tenantSlug)
  ]);

  const language = theme?.language || 'en';
  const t = (key: TranslationKeys) => getTranslation(language, key);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white relative overflow-hidden">
        {theme?.banner?.image?.secure_url && (
          <div className="absolute inset-0 z-0">
            <img 
              src={theme.banner.image.secure_url} 
              alt={theme.banner.title || 'Banner Background'} 
              className="w-full h-full object-cover" 
            />
            {/* Dark overlay to ensure white text is readable over the banner */}
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        )}
        <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="max-w-2xl">
            {theme?.banner?.subtitle && (
              <span className="inline-block py-1 px-3 rounded-full bg-blue-800/50 text-blue-200 text-sm font-semibold mb-6 border border-blue-700/50 backdrop-blur-sm">
                {theme.banner.subtitle}
              </span>
            )}
            {theme?.banner?.title && (
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight whitespace-pre-line">
                {theme.banner.title}
              </h1>
            )}
            {theme?.banner?.description && (
              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
                {theme.banner.description}
              </p>
            )}
            {theme?.banner?.buttonText && theme?.banner?.buttonLink && (
              <Link prefetch={false} 
                href={theme.banner.buttonLink} 
                className="inline-flex items-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
              >
                {theme.banner.buttonText} <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Top Categories */}
      {categories.length > 0 && (
        <div className="bg-white border-b border-gray-100 shadow-sm relative z-20 -mt-6 rounded-t-3xl mx-4 lg:mx-auto max-w-[1400px] w-[calc(100%-2rem)] lg:w-full">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('topCategories')}</h2>
              <Link prefetch={false} href="/categories" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                {t('seeAllCategories')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <CategorySlider>
              {categories.map((cat: any) => (
                <Link prefetch={false} href={`/category/${cat.slug || cat._id}`} key={cat._id} className="flex flex-col items-center justify-center gap-3 min-w-[100px] sm:min-w-[140px] snap-start cursor-pointer group">
                  <div className="text-gray-600 group-hover:text-indigo-600 group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300 w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    {cat.image?.secure_url ? (
                      <img src={cat.image.secure_url} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      getCategoryIcon(cat.name)
                    )}
                  </div>
                  <span className="text-[11px] sm:text-sm font-bold text-gray-800 text-center uppercase tracking-wide group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </CategorySlider>
          </div>
        </div>
      )}

      <main id="home-main" className="max-w-[1400px] mx-auto px-6 py-16 w-full">
        <section>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('collections')}</h2>
              <p className="text-gray-500 mt-2">Explore our latest arrivals</p>
            </div>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 font-medium text-lg">No products found in collections.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((product: any) => (
                <ProductCard 
                  key={product._id || product.id} 
                  product={product}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

