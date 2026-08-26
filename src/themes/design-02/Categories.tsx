import Link from 'next/link';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { getTheme } from '@/core/api/store';

async function getCategories(tenantSlug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data?.data || json?.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

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

export default async function Design02Categories({ tenantSlug }: { tenantSlug: string }) {
  const [categories, storeInfo, theme] = await Promise.all([
    getCategories(tenantSlug),
    getStoreInfo(tenantSlug),
    getTheme(tenantSlug)
  ]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <Header storeInfo={storeInfo} />

      {/* Breadcrumb & Title Area */}
      <div className="max-w-7xl mx-auto px-8 py-12 text-center border-b border-gray-50">
        <div className="text-xs font-medium text-gray-400 mb-6 uppercase tracking-widest">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span className="mx-3">/</span>
          <span className="text-gray-900">Collections</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight">Shop by Category</h1>
        <p className="mt-4 text-gray-500 font-light max-w-2xl mx-auto">
          Explore our curated collections designed for modern living.
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-16 flex-1 w-full">
        {categories.length === 0 ? (
          <div className="text-center py-24 text-gray-400 font-light text-lg">
            No categories found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {categories.map((cat: any) => (
              <Link 
                href={`/category/${cat.slug || cat._id}`} 
                key={cat._id} 
                className="group block text-center border border-transparent hover:border-gray-100 p-8 rounded-xl transition-all duration-300 hover:shadow-sm"
              >
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                  {cat.image?.secure_url ? (
                    <img src={cat.image.secure_url} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 font-light text-sm">No Image</span>
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 uppercase tracking-widest mb-2">{cat.name}</h3>
                {cat.description && (
                  <p className="text-sm text-gray-500 font-light line-clamp-2">{cat.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
