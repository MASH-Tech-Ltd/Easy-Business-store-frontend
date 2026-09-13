import { storefrontFetch } from "../../utils/storefrontFetch";
import { headers } from 'next/headers';
import Link from 'next/link';
import Header05 from './components/layout/Header';
import Footer05 from './components/layout/Footer';

export default async function CategoriesPage05() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [storeInfoRes, themeRes, categoriesRes] = await Promise.all([
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } }),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 60 } }),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } })
  ]);

  const storeInfo = storeInfoRes.ok ? (await storeInfoRes.json()).data : null;
  const theme = themeRes.ok ? (await themeRes.json()).data : null;
  const categories = categoriesRes.ok ? (await categoriesRes.json()).data || [] : [];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header05 storeInfo={storeInfo} />

      <div className="pt-16 pb-8 px-6 lg:px-12 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">All Categories</h1>
        <div className="flex items-center justify-center text-[13px] font-semibold text-gray-400 uppercase tracking-widest gap-3">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <span className="text-black">Categories</span>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 flex-1 w-full">
        {categories.length === 0 ? (
          <div className="py-32 text-center flex flex-col items-center justify-center">
            <svg className="w-16 h-16 text-gray-200 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500">Check back later for updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {categories.map((c: any) => (
              <Link key={c._id} href={`/category/${c.slug || c._id}`} 
                className="group relative h-[280px] rounded-3xl bg-[#F8F9FA] overflow-hidden flex flex-col p-8 border border-gray-100 hover:border-black transition-all shadow-sm hover:shadow-lg duration-500">
                
                <div className="z-10 flex justify-between items-start w-full mb-4">
                  <div className="pr-4">
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-black mb-1">{c.name}</h2>
                    <p className="text-xs text-gray-500 line-clamp-2 group-hover:text-gray-700 leading-relaxed">
                      {c.description || `Explore our premium selection of ${c.name}.`}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </div>

                <div className="flex-1 w-full mt-4 relative rounded-[1.5rem] overflow-hidden">
                  {c.image ? (
                    <img src={c.image?.secure_url || c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">No Image</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer05 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
