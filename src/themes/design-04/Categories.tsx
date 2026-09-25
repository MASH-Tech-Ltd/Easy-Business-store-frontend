import { storefrontFetch } from "../../utils/storefrontFetch";
import Link from 'next/link';
import Footer04 from './components/layout/Footer';
import Header04 from './components/layout/Header';

async function getCategories(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data?.data || json?.data || [];
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}
async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    return res.ok ? (await res.json()).data : null;
  } catch { return null; }
}
async function getTheme(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 60 } });
    return res.ok ? (await res.json()).data : null;
  } catch { return null; }
}

import { getTranslation } from '@/utils/translations';

export default async function Design04Categories({ tenantSlug }: { tenantSlug: string }) {
  const [categories, storeInfo, theme] = await Promise.all([
    getCategories(tenantSlug),
    getStoreInfo(tenantSlug),
    getTheme(tenantSlug)
  ]);

  const language = storeInfo?.language || 'en';
  const t = (key: any) => getTranslation(language, key);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header04 storeInfo={storeInfo} theme={theme} />
      
      <div className="bg-white border-b border-gray-100 py-6 md:py-12 px-6 text-center">
        <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight mb-2 md:mb-4">{t('categories') || 'Categories'}</h1>
        <div className="flex items-center justify-center text-xs md:text-sm font-semibold text-gray-400 gap-2">
          <Link prefetch={false} href="/" className="hover:text-gray-900 transition-colors">{t('home') || 'Home'}</Link>
          <span>/</span>
          <span className="text-gray-900">{t('categories') || 'Categories'}</span>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 py-8 md:py-16 flex-1 w-full">
        {categories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-500 font-semibold shadow-sm">
            No categories found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat: any) => (
              <Link prefetch={false} 
                href={`/category/${cat.slug || cat._id}`} 
                key={cat._id} 
                className="group flex flex-col items-center justify-center gap-2 md:gap-4 p-4 md:p-8 bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all cursor-pointer"
              >
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-300">
                  {cat.image?.secure_url ? (
                    <img src={cat.image.secure_url} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] md:text-xs text-gray-300">No Image</span>
                  )}
                </div>
                <h3 className="text-sm md:text-lg font-bold text-gray-900 text-center tracking-wide group-hover:text-gray-600 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer04 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
