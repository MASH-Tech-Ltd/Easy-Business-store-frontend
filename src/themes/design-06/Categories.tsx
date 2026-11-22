import { getCategoryCardImageUrl } from '@/utils/imageOptimizer';
import { storefrontFetch } from '../../utils/storefrontFetch';
import { headers } from 'next/headers';
import Link from 'next/link';
import Header06 from './components/layout/Header';
import Footer06 from './components/layout/Footer';
import { getTranslation } from '@/utils/translations';
import { ArrowRight } from 'lucide-react';

export default async function CategoriesPage06() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [storeInfoRes, themeRes, categoriesRes] = await Promise.all([
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } }),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 60 } }),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } }),
  ]);

  const storeInfo = storeInfoRes.ok ? (await storeInfoRes.json()).data : null;
  const theme = themeRes.ok ? (await themeRes.json()).data : null;
  const categories = categoriesRes.ok ? (await categoriesRes.json()).data || [] : [];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col text-gray-900">
      <Header06 storeInfo={storeInfo} />

      {/* Page Title & Breadcrumbs */}
      <div className="pt-8 sm:pt-12 pb-6 px-4 sm:px-6 lg:px-12 text-center max-w-[1400px] mx-auto w-full">
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-3">
          All Collections
        </h1>
        <div className="flex items-center justify-center text-xs font-semibold text-gray-400 uppercase tracking-widest gap-2">
          <Link prefetch={false} href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900">Categories</span>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 flex-1 w-full">
        {categories.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500 text-sm">Check back later for newly curated collections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 lg:gap-5">
            {categories.map((c: any) => {
              const img = c.image?.secure_url || c.image?.url || c.image;
              return (
                <Link
                  prefetch={false}
                  key={c._id}
                  href={`/category/${c.slug || c._id}`}
                  className="group relative aspect-[4/5] sm:aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden flex flex-col justify-end p-1.5 sm:p-3 border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-500 bg-gray-50 cursor-default"
                >
                  <div className="absolute inset-0 bg-gray-100 overflow-hidden">
                    {img ? (
                      <img
                        src={getCategoryCardImageUrl(img)}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] sm:text-xs font-bold uppercase">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                  <div className="relative z-10 w-full flex justify-center">
                    <span className="w-full bg-white/95 backdrop-blur-md text-gray-900 text-[10px] sm:text-sm font-semibold py-1 sm:py-2 px-1 sm:px-3.5 rounded-lg sm:rounded-xl shadow-md text-center border border-white/60 group-hover:bg-black group-hover:text-white transition-all duration-300 truncate block cursor-pointer">
                      {c.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer06 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
