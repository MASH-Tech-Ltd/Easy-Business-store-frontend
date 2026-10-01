import { getStoreInfo, getTheme } from '@/core/api/store';
import { getProducts, getBestsellingProducts, getJustForYouProducts } from '@/core/api/product';
import { getCategories } from '@/core/api/category';
import Link from 'next/link';
import Header03 from './components/layout/Header';
import Footer03 from './components/layout/Footer';
import Design03ProductCard from './components/ui/ProductCard';
import HeroBannerSlider03 from './components/ui/HeroBannerSlider';
import { getTranslation } from '@/utils/translations';

export default async function Design03Home({ tenantSlug }: { tenantSlug: string }) {

  if (tenantSlug === 'main') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h1 className="text-4xl font-black uppercase tracking-tighter">System Landing</h1>
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
  const language = storeInfo?.language || "en";
  const t = (key: any) => getTranslation(language || 'en', key);


  const displayCategories = categories?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-black font-sans text-white flex flex-col selection:bg-cyan-500/30">
      <Header03 storeInfo={storeInfo} />

      {/* Main Content Area - Requires padding left on desktop for the sidebar */}
      <main className="lg:ml-64 flex flex-col min-h-screen border-l border-white/10">
        
        {/* Brutalist Hero Section */}
        <HeroBannerSlider03 banner={theme?.banner} />

        {/* Marquee Banner */}
        <div className="border-b border-white/10 bg-cyan-400 text-black py-3 overflow-hidden whitespace-nowrap flex items-center">
          <div className="animate-[marquee_20s_linear_infinite] inline-block font-mono text-xs font-black uppercase tracking-widest">
             / NEXT-GEN HARDWARE / MAXIMUM EFFICIENCY / UNCOMPROMISED QUALITY / NEXT-GEN HARDWARE / MAXIMUM EFFICIENCY / UNCOMPROMISED QUALITY / NEXT-GEN HARDWARE / MAXIMUM EFFICIENCY / UNCOMPROMISED QUALITY 
          </div>
        </div>

        {/* Categories Grid */}
        <section className="border-b border-white/10 bg-[#050505]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            <div className="p-8 md:p-12 md:col-span-3 border-b border-white/10 flex justify-between items-end">
              <div>
                <h3 className="text-sm text-cyan-400 font-mono mb-2 uppercase tracking-widest">Database</h3>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{t('categories') || 'Categories'}</h2>
              </div>
              <Link prefetch={false} href="/categories" className="text-xs font-bold uppercase tracking-widest hover:text-cyan-400 transition-colors hidden md:block">
                View Directory [ALL]
              </Link>
            </div>
            
            {displayCategories.map((category: any, index: number) => (
              <Link prefetch={false}
                key={category._id}
                href={`/category/${category.slug || category._id}`}
                className={`group relative h-64 border-b border-white/10 md:border-r ${index % 3 === 2 ? 'md:border-r-0' : ''} bg-[#0a0a0a] overflow-hidden`}
              >
                {category.image?.secure_url ? (
                  <img 
                    src={category.image.secure_url} 
                    alt={category.name} 
                    className="w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" 
                  />
                ) : (
                  <div className="w-full h-full bg-[#111]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="text-[10px] text-cyan-400 font-mono mb-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Sector {index + 1}</div>
                  <h4 className="text-2xl font-black uppercase tracking-tighter text-white">{category.name}</h4>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bestselling Grid */}
        <section className="border-b border-white/10 bg-black">
          <div className="p-8 md:p-12 border-b border-white/10">
            <h3 className="text-sm text-cyan-400 font-mono mb-2 uppercase tracking-widest">Top Tier</h3>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Bestselling</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-0">
            {bestsellers.map((product: any, index: number) => (
              <div key={product._id || product.id} className={`border-b sm:border-r border-white/10 ${index % 4 === 3 ? 'lg:border-r-0' : ''}`}>
                <Design03ProductCard product={product} isBestSelling={true} theme={theme} />
              </div>
            ))}
          </div>
        </section>

        <Footer03 storeInfo={storeInfo} theme={theme} />
      </main>
    </div>
  );
}
