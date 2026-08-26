import { headers } from 'next/headers';
import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';
import AddToCartClient from './AddToCartClient';
import { getTranslation, TranslationKeys } from '@/utils/translations';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

async function getTheme(tenantSlug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

async function getProduct(tenantSlug: string, productSlug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products/${productSlug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    return null;
  }
}

export default async function Design02ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [storeInfo, product, theme] = await Promise.all([
    getStoreInfo(tenantSlug),
    getProduct(tenantSlug, resolvedParams.slug),
    getTheme(tenantSlug)
  ]);

  const language = theme?.language || 'en';
  const t = (key: TranslationKeys) => getTranslation(language, key);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center font-light">
          <h1 className="text-2xl mb-4">Product not found</h1>
          <Link href="/" className="text-gray-900 underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">

      <Header storeInfo={storeInfo} />

      <div className="max-w-7xl mx-auto w-full px-8 py-6 flex items-center text-xs text-gray-400 gap-3">
        <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>/</span>
        <span className="hover:text-gray-900 cursor-pointer">{product.categoryId?.name || 'Category'}</span>
        <span>/</span>
        <span className="text-gray-900">{product.title}</span>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Badges and Brand */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {product.brand && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-widest rounded-sm">
                  {product.brand}
                </span>
              )}
              {product.isAuthentic && (
                <span className="flex items-center gap-1 text-xs font-bold text-green-700 uppercase tracking-widest">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Authentic
                </span>
              )}
              {product.badgeText && (
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-widest rounded-sm">
                  {product.badgeText}
                </span>
              )}
            </div>
            <h1 className="text-4xl font-light text-gray-900 mb-4 leading-tight">{product.title}</h1>
            
            <div className="text-2xl font-medium text-gray-900 mb-8">
              ৳{product.discountPrice || product.discountedPrice || product.price}
              {(product.originalPrice > (product.discountPrice || product.discountedPrice)) && (
                <span className="text-lg text-gray-400 line-through ml-4 font-light">
                  ৳{product.originalPrice}
                </span>
              )}
            </div>


            <div className="mt-8 mb-8 space-y-4 text-sm text-gray-500">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>Availability</span>
                <span className={product.stock > 0 ? "text-gray-900" : "text-gray-400"}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>SKU</span>
                <span className="text-gray-900">{product.sku || product._id.slice(-6)}</span>
              </div>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Key Highlights</h3>
                <ul className="space-y-3">
                  {product.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                      <svg className="w-4 h-4 text-gray-900 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-auto pt-8">
              <AddToCartClient product={product} theme={theme} />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-24 mt-16 border-t border-gray-100 pt-16">
          <div className="space-y-16">

              {product.shortDescription && (
                <div className="text-gray-600 font-light leading-relaxed text-lg text-center max-w-3xl mx-auto italic">
                  "{product.shortDescription}"
                </div>
              )}
              
              {product.specifications && product.specifications.length > 0 && (
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-6 border-b border-gray-100 pb-4">Technical Specifications</h3>
                  <div className="bg-gray-50 rounded-xl p-6 md:p-8">
                    {product.specifications.map((group: any, gIdx: number) => (
                      <div key={gIdx} className={`grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-12 ${gIdx > 0 ? "mt-8 border-t border-gray-200 pt-8" : ""}`}>
                        <div className="md:col-span-1">
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">{group.group}</h4>
                        </div>
                        <div className="md:col-span-3">
                          <dl className="divide-y divide-gray-200 border-t border-gray-200">
                            {group.entries.map((entry: any, eIdx: number) => (
                              <div key={eIdx} className="flex py-3 justify-between items-center text-sm">
                                <dt className="font-medium text-gray-500 w-1/3 pr-4">{entry.name}</dt>
                                <dd className="text-gray-900 font-medium text-right w-2/3">{entry.value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {product.description && (
                <div className="prose prose-gray max-w-none font-light leading-relaxed">
                  <h3 className="text-xl font-medium text-gray-900 mb-6 border-b border-gray-100 pb-4">Product Details</h3>
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              )}
              
              {/* External Videos Section */}
              {product.videos && product.videos.length > 0 && (
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-6 border-b border-gray-100 pb-4">Product Videos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div key={index} className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                          <iframe 
                            src={embedUrl}
                            title={`Product Video ${index + 1}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
            </div>
        </div>
      </main>

      <Footer storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
