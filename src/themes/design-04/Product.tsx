import { storefrontFetch } from "../../utils/storefrontFetch";
import { headers } from 'next/headers';
import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';
import AddToCartClient from './AddToCartClient';
import type { Metadata, ResolvingMetadata } from 'next';
import Header04 from './components/layout/Header';
import Footer04 from './components/layout/Footer';
import { getTranslation } from '@/utils/translations';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    return res.ok ? (await res.json()).data : null;
  } catch { return null; }
}

async function getProduct(tenantSlug: string, productSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products/${productSlug}`, { next: { revalidate: 60 } });
    return res.ok ? (await res.json()).data : null;
  } catch { return null; }
}

async function getTheme(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 60 } });
    return res.ok ? (await res.json()).data : null;
  } catch { return null; }
}

export default async function ProductPage04({ params }: { params: Promise<{ slug: string }> }) {

  const resolvedParams = await params;
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [storeInfo, product, theme] = await Promise.all([
    getStoreInfo(tenantSlug),
    getProduct(tenantSlug, resolvedParams.slug),
    getTheme(tenantSlug)
  ]);
  const language = theme?.language || "en";
  const t = (key: any) => getTranslation(language || 'en', key);


  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-4">{t('productNotFound') || 'Product not found'}</h1>
          <Link prefetch={false} href="/" className="text-gray-500 hover:text-gray-900 underline font-semibold">{t('returnHome') || 'Return Home'}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header04 storeInfo={storeInfo} theme={theme} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-6 px-6">
        <div className="max-w-[1400px] mx-auto flex items-center text-sm font-semibold text-gray-400 gap-2">
          <Link prefetch={false} href="/" className="hover:text-gray-900 transition-colors">{t('home') || 'Home'}</Link>
          <span>/</span>
          <span className="hover:text-gray-900 cursor-pointer">{product.categoryId?.name || 'Category'}</span>
          <span>/</span>
          <span className="text-gray-900 truncate">{product.title}</span>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 py-12 flex-1 w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 lg:p-12 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            
            {/* Gallery */}
            <div>
              <ProductGallery images={product.images} title={product.title} />
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-black text-gray-900 leading-tight mb-4">{product.title}</h1>
              
              <div className="flex items-center gap-4 text-sm font-semibold text-gray-500 mb-6">
                <span>SKU: {product.sku || product._id.slice(-6)}</span>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                {product.stock > 0 ? (
                  <span className="text-green-600">In Stock ({product.stock})</span>
                ) : (
                  <span className="text-red-500">{t('outOfStock') || 'Out of Stock'}</span>
                )}
              </div>

              <div className="flex items-end gap-4 mb-8">
                <span className="text-4xl font-black text-gray-900 tracking-tight">{theme?.currencySymbol || '৳'}{' '}{product.discountedPrice.toLocaleString()}</span>
                {product.originalPrice > product.discountedPrice && (
                  <span className="text-lg text-gray-400 line-through font-semibold pb-1">{theme?.currencySymbol || '৳'}{' '}{product.originalPrice.toLocaleString()}</span>
                )}
              </div>

              {product.shortDescription && (
                <div className="mb-8 text-gray-500 leading-relaxed">
                  {product.shortDescription}
                </div>
              )}

              {/* Add to Cart Actions */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                <AddToCartClient product={product} theme={theme} />
              </div>

              {/* Quick Specs */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 uppercase tracking-wider text-xs mb-4">{t('keyHighlights') || 'Highlights'}</h3>
                  <ul className="space-y-2">
                    {product.features.map((feat: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                        <span className="text-gray-900 mt-0.5">•</span> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Description & Specs */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 lg:p-12 mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-8">{t('productDetails') || 'Product Details'}</h2>
          
          {product.description && (
            <div className="prose max-w-none text-gray-600 mb-12" dangerouslySetInnerHTML={{ __html: product.description }} />
          )}

          {product.specifications && product.specifications.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">{t('specifications')}</h3>
              <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {product.specifications.map((specGroup: any, i: number) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-4">
                    <div className="bg-gray-50 p-4 font-bold text-gray-900 border-b md:border-b-0 md:border-r border-gray-100">{specGroup.group || 'General'}</div>
                    <div className="md:col-span-3 p-4">
                      <div className="space-y-2 text-sm">
                        {specGroup.entries?.map((entry: any, j: number) => (
                          <div key={j} className="grid grid-cols-3">
                            <span className="text-gray-500">{entry.name}</span>
                            <span className="col-span-2 text-gray-900 font-medium">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External Videos Section */}
          {product.videos && product.videos.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Product Videos</h3>
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
                    <div key={index} className="aspect-video bg-gray-100 rounded-2xl overflow-hidden">
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
      </main>

      <Footer04 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
