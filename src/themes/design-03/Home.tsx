import { getStoreInfo, getTheme } from '@/core/api/store';
import { getProducts, getBestsellingProducts, getJustForYouProducts } from '@/core/api/product';
import { getCategories } from '@/core/api/category';
import Link from 'next/link';
import Header03 from './components/layout/Header';
import Footer03 from './components/layout/Footer';
import Design03ProductCard from './components/ui/ProductCard';

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

  const displayCategories = categories?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-black font-sans text-white flex flex-col selection:bg-cyan-500/30">
      <Header03 storeInfo={storeInfo} />

      {/* Main Content Area - Requires padding left on desktop for the sidebar */}
      <main className="lg:ml-64 flex flex-col min-h-screen border-l border-white/10">
        
        {/* Brutalist Hero Section */}
        <section className="relative flex flex-col border-b border-white/10 min-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 h-full flex-1">
            
            {/* Left side: Typography & Actions */}
            <div className="p-8 md:p-16 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
              <div className="relative z-10">
                <div className="inline-block px-3 py-1 bg-cyan-400 text-black text-[10px] font-black uppercase tracking-widest mb-6">System Initialized</div>
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase mb-8">
                  {theme?.banner?.title || (
                    <>PRECISION<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">ENGINEERED</span></>
                  )}
                </h2>
                <p className="text-lg md:text-xl text-gray-400 font-mono mb-12 max-w-xl leading-relaxed">
                  {theme?.banner?.subtitle || 'Discover our curated collection of premium electronics. Form meets function in high-fidelity.'}
                </p>
                <Link 
                  href={theme?.banner?.buttonLink || '/categories'} 
                  className="inline-flex items-center justify-center px-12 py-5 bg-white text-black text-sm font-black uppercase tracking-[0.2em] hover:bg-cyan-400 transition-colors border border-transparent hover:border-white"
                >
                  {theme?.banner?.buttonText || 'Initialize Protocol'}
                </Link>
              </div>
            </div>

            {/* Right side: Image */}
            <div className="relative min-h-[40vh] md:min-h-full bg-[#050505]">
              {theme?.banner?.image?.secure_url ? (
                <img 
                  src={theme.banner.image.secure_url} 
                  alt={theme.banner.title || 'Banner'} 
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" 
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                  <span className="text-white/10 font-mono text-2xl uppercase tracking-widest">No Signal</span>
                </div>
              )}
              {/* Tech overlay lines */}
              <div className="absolute inset-0 pointer-events-none border-[12px] border-black/40" />
            </div>

          </div>
        </section>

        {/* Marquee Banner */}
        <div className="border-b border-white/10 bg-cyan-400 text-black py-3 overflow-hidden whitespace-nowrap flex items-center">
          <div className="animate-[marquee_20s_linear_infinite] inline-block font-mono text-xs font-black uppercase tracking-widest">
             / NEXT-GEN HARDWARE / MAXIMUM EFFICIENCY / UNCOMPROMISED QUALITY / NEXT-GEN HARDWARE / MAXIMUM EFFICIENCY / UNCOMPROMISED QUALITY / NEXT-GEN HARDWARE / MAXIMUM EFFICIENCY / UNCOMPROMISED QUALITY 
          </div>
        </div>

        {/* Categories Grid */}
        <section className="border-b border-white/10 bg-[#050505]">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="p-8 md:p-12 md:col-span-3 border-b border-white/10 flex justify-between items-end">
              <div>
                <h3 className="text-sm text-cyan-400 font-mono mb-2 uppercase tracking-widest">Database</h3>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Categories</h2>
              </div>
              <Link href="/categories" className="text-xs font-bold uppercase tracking-widest hover:text-cyan-400 transition-colors hidden md:block">
                View Directory [ALL]
              </Link>
            </div>
            
            {displayCategories.map((category: any, index: number) => (
              <Link
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellers.map((product: any, index: number) => (
              <div key={product._id || product.id} className={`border-b sm:border-r border-white/10 ${index % 4 === 3 ? 'lg:border-r-0' : ''}`}>
                <Design03ProductCard product={product} theme={theme} />
              </div>
            ))}
          </div>
        </section>

        <Footer03 storeInfo={storeInfo} theme={theme} />
      </main>
    </div>
  );
}
