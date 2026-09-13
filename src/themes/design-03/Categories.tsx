import { storefrontFetch } from "../../utils/storefrontFetch";
import Link from 'next/link';
import { getStoreInfo, getTheme } from '@/core/api/store';
import Header03 from './components/layout/Header';
import Footer03 from './components/layout/Footer';

async function getCategories(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data?.data || json?.data || [];
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export default async function Design03Categories({ tenantSlug }: { tenantSlug: string }) {
  const [categories, storeInfo, theme] = await Promise.all([
    getCategories(tenantSlug),
    getStoreInfo(tenantSlug),
    getTheme(tenantSlug)
  ]);

  return (
    <div className="min-h-screen bg-black font-sans text-white flex flex-col selection:bg-cyan-500/30">
      <Header03 storeInfo={storeInfo} />

      <main className="lg:ml-64 flex flex-col min-h-screen border-l border-white/10 bg-[#050505]">
        
        {/* Breadcrumbs */}
        <div className="w-full px-8 py-4 flex items-center text-xs font-mono uppercase tracking-widest text-gray-500 gap-3 border-b border-white/10 bg-black">
          <Link href="/" className="hover:text-cyan-400 transition-colors">ROOT</Link>
          <span className="text-white/20">/</span>
          <span className="text-white">DIRECTORY</span>
        </div>

        {/* Hero */}
        <section className="p-8 md:p-16 border-b border-white/10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
          <div className="max-w-3xl">
            <div className="inline-block px-3 py-1 bg-cyan-400 text-black text-[10px] font-black uppercase tracking-widest mb-6">GLOBAL DIRECTORY</div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase mb-6">
              CATEGORY <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">INDEX</span>
            </h2>
            <p className="text-lg text-gray-400 font-mono max-w-2xl">
              Access structural nodes and sub-directories.
            </p>
          </div>
        </section>

        <section className="flex-1 w-full bg-black">
          {categories.length === 0 ? (
            <div className="text-center py-24 text-red-500 font-mono text-xs uppercase tracking-widest flex items-center justify-center flex-col gap-4 border-b border-white/10">
              <span className="text-4xl">!</span>
              DATABASE EMPTY
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-b border-white/10">
              {categories.map((cat: any, index: number) => (
                <Link
                  href={`/category/${cat.slug || cat._id}`}
                  key={cat._id}
                  className={`group relative h-64 border-b sm:border-r border-white/10 ${index % 4 === 3 ? 'xl:border-r-0' : ''} bg-[#0a0a0a] overflow-hidden`}
                >
                  {cat.image?.secure_url ? (
                    <img src={cat.image.secure_url} alt={cat.name} className="w-full h-full object-cover mix-blend-luminosity opacity-40 group-hover:mix-blend-normal group-hover:opacity-80 transition-all duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#111]">
                       <span className="text-gray-600 font-mono text-xs uppercase">No Signal</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="text-[10px] text-cyan-400 font-mono mb-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Sector {index + 1}</div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-gray-500 font-mono text-[10px] mt-2 line-clamp-2 uppercase">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <Footer03 storeInfo={storeInfo} theme={theme} />
      </main>
    </div>
  );
}
