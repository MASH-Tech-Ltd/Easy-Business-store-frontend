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

export default async function Design04Categories({ tenantSlug }: { tenantSlug: string }) {
  const [categories, storeInfo] = await Promise.all([
    getCategories(tenantSlug),
    getStoreInfo(tenantSlug)
  ]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header04 storeInfo={storeInfo} />
      
      <div className="bg-white border-b border-gray-100 py-12 px-6 text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Categories</h1>
        <div className="flex items-center justify-center text-sm font-semibold text-gray-400 gap-2">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900">Categories</span>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 py-16 flex-1 w-full">
        {categories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-500 font-semibold shadow-sm">
            No categories found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat: any) => (
              <Link 
                href={`/category/${cat.slug || cat._id}`} 
                key={cat._id} 
                className="group flex flex-col items-center justify-center gap-4 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all cursor-pointer"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden mb-2 group-hover:scale-110 transition-transform duration-300">
                  {cat.image?.secure_url ? (
                    <img src={cat.image.secure_url} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-300">No Image</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center tracking-wide group-hover:text-gray-600 transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer04 storeInfo={storeInfo} />
    </div>
  );
}
