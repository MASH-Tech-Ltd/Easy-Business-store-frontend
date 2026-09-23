import { storefrontFetch } from "../../utils/storefrontFetch";
import { headers } from 'next/headers';
import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';
import AddToCartClient03 from './AddToCartClient';
import { getTheme } from '@/core/api/store';
import Header03 from './components/layout/Header';
import Footer03 from './components/layout/Footer';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

async function getProduct(tenantSlug: string, productSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products/${productSlug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data || null;
  } catch { return null; }
}

export default async function Design03ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [storeInfo, product, theme] = await Promise.all([
    getStoreInfo(tenantSlug),
    getProduct(tenantSlug, resolvedParams.slug),
    getTheme(tenantSlug)
  ]);

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-cyan-500/30">
        <Header03 storeInfo={storeInfo} />
        <main className="lg:ml-64 flex flex-col min-h-screen border-l border-white/10 bg-[#050505] items-center justify-center">
          <div className="text-center font-mono">
            <span className="text-red-500 text-6xl block mb-4">!</span>
            <h1 className="text-2xl font-black text-white mb-4 uppercase tracking-widest">RECORD NOT FOUND</h1>
            <Link prefetch={false} href="/" className="text-cyan-400 font-bold hover:text-white transition-colors border border-cyan-400 px-6 py-2 uppercase tracking-widest">Return to ROOT</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 flex flex-col">
      <Header03 storeInfo={storeInfo} />

      <main className="lg:ml-64 flex flex-col min-h-screen border-l border-white/10 bg-[#050505]">
        
        {/* Breadcrumbs - Brutalist */}
        <div className="w-full px-8 py-4 flex items-center text-xs font-mono uppercase tracking-widest text-gray-500 gap-3 border-b border-white/10 bg-black">
          <Link prefetch={false} href="/" className="hover:text-cyan-400 transition-colors">ROOT</Link>
          <span className="text-white/20">/</span>
          <span className="hover:text-cyan-400 transition-colors cursor-pointer">{product.categoryId?.name || 'CATALOG'}</span>
          <span className="text-white/20">/</span>
          <span className="text-white truncate">ITEM_{product._id?.substring(0,6) || product.id?.substring(0,6) || 'X'}</span>
        </div>

        {/* Product Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-white/10 bg-black">
          
          <div className="lg:order-1 relative bg-[#0a0a0a] border-b lg:border-b-0 lg:border-r border-white/10 p-8 md:p-16 flex items-center justify-center">
            {/* Tech crosshairs */}
            <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50" />
            <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50" />
            <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-cyan-400/50" />
            <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-cyan-400/50" />
            
            <div className="w-full max-w-lg aspect-square relative mix-blend-luminosity hover:mix-blend-normal transition-all duration-700">
              <ProductGallery images={product.images} title={product.title} />
            </div>
          </div>

          <div className="lg:order-2 flex flex-col bg-[#050505]">
            <div className="p-8 md:p-12 border-b border-white/10">
              {/* Badges */}
              {(product.brand || product.isAuthentic || product.badgeText) && (
                <div className="flex flex-wrap gap-2 mb-6 font-mono text-[10px] uppercase tracking-widest">
                  {product.brand && <span className="text-cyan-400 border border-cyan-400/30 bg-cyan-400/10 px-3 py-1">[ BR: {product.brand} ]</span>}
                  {product.isAuthentic && <span className="text-green-400 border border-green-400/30 bg-green-400/10 px-3 py-1">[ AUTHENTICATED ]</span>}
                  {product.badgeText && <span className="text-white border border-white/30 bg-white/10 px-3 py-1">[ {product.badgeText} ]</span>}
                </div>
              )}

              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-[1] uppercase mb-8">{product.title}</h1>
              
              {/* Price */}
              <div className="flex items-end gap-4">
                <span className="text-5xl font-black text-cyan-400 tracking-tighter">{theme?.currencySymbol || '৳'}{' '}{product.discountedPrice || product.originalPrice || product.price}</span>
                {(product.originalPrice > (product.discountedPrice || 0)) && (
                  <span className="text-xl text-gray-600 line-through font-mono mb-1">{theme?.currencySymbol || '৳'}{' '}{product.originalPrice}</span>
                )}
              </div>
            </div>

            {/* Availability & SKU */}
            <div className="grid grid-cols-2 text-xs font-mono uppercase tracking-widest border-b border-white/10 bg-black">
              <div className="p-8 border-r border-white/10">
                <div className="text-gray-600 mb-2">STATUS</div>
                <div className={`font-bold ${product.stock > 0 ? 'text-green-500 flex items-center gap-2' : 'text-red-500 flex items-center gap-2'}`}>
                  <span className={`w-2 h-2 ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                  {product.stock > 0 ? 'READY / IN STOCK' : 'OFFLINE / OUT OF STOCK'}
                </div>
              </div>
              <div className="p-8">
                <div className="text-gray-600 mb-2">IDENTIFIER (SKU)</div>
                <div className="text-white font-bold">{product.sku || product._id?.slice(-8) || 'N/A'}</div>
              </div>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="p-8 md:p-12 border-b border-white/10">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">SPEC / HIGHLIGHTS</h3>
                <ul className="space-y-4">
                  {product.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-4 text-xs font-mono text-gray-300 uppercase">
                      <span className="text-cyan-400 mt-0.5">]</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-8 md:p-12 mt-auto bg-black">
              <AddToCartClient03 product={product} theme={theme} />
            </div>
          </div>
        </div>

        {/* Short Description */}
        {product.shortDescription && (
          <div className="p-8 md:p-16 border-b border-white/10 bg-black text-gray-400 font-mono text-sm leading-relaxed uppercase border-l-4 border-l-cyan-400">
            {product.shortDescription}
          </div>
        )}

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="border-b border-white/10">
            <div className="p-8 md:p-12 border-b border-white/10 bg-[#050505]">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">TECHNICAL DATA</h3>
            </div>
            <div className="bg-black">
              {product.specifications.map((group: any, gIdx: number) => (
                <div key={gIdx} className={`grid grid-cols-1 md:grid-cols-4 ${gIdx > 0 ? 'border-t border-white/10' : ''}`}>
                  <div className="md:col-span-1 p-6 md:p-8 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-white/10 flex items-center">
                    <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{group.group}</h4>
                  </div>
                  <div className="md:col-span-3 p-6 md:p-8">
                    <dl className="grid grid-cols-1 gap-y-4">
                      {group.entries.map((entry: any, eIdx: number) => (
                        <div key={eIdx} className="grid grid-cols-2 text-xs font-mono uppercase tracking-widest border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                          <dt className="text-gray-600">{entry.name}</dt>
                          <dd className="text-white text-right">{entry.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="p-8 md:p-16 bg-[#050505] border-b border-white/10">
            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-8 border-b border-white/10 pb-4">DETAILED BRIEFING</h3>
            <div className="text-gray-300 font-mono text-sm leading-relaxed prose prose-invert max-w-4xl" dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        )}

        {/* External Videos Section */}
        {product.videos && product.videos.length > 0 && (
          <div className="p-8 md:p-16 bg-[#050505] border-b border-white/10">
            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-8 border-b border-white/10 pb-4">VIDEO ARCHIVE</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
              {product.videos.map((video: string, index: number) => {
                let embedUrl = video;
                try {
                  const url = new URL(video);
                  if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
                    const videoId = url.hostname.includes('youtu.be') ? url.pathname.slice(1) : url.searchParams.get('v');
                    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
                  }
                } catch (e) {}
                return (
                  <div key={index} className="aspect-video bg-[#0a0a0a] border border-white/10 overflow-hidden">
                    <iframe 
                      src={embedUrl}
                      title={`Product Video ${index + 1}`}
                      className="w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Footer03 storeInfo={storeInfo} theme={theme} />
      </main>
    </div>
  );
}
