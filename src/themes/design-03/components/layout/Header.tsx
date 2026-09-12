import Link from 'next/link';
import { headers } from 'next/headers';
import { ShoppingCart, Home, Grid, ChevronRight } from 'lucide-react';
import GlobalSearch03 from '../ui/GlobalSearch';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

export default async function Header03({ storeInfo }: { storeInfo?: any }) {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden flex flex-col p-4 border-b border-white/10 bg-[#050505] sticky top-0 z-50 gap-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {storeInfo?.logo && <img src={storeInfo.logo} alt="Logo" className="w-8 h-8 rounded-none border border-white/20" />}
            <span className="font-bold tracking-widest uppercase text-sm">{storeInfo?.name || 'Store'}</span>
          </Link>
          <Link href="/cart" className="text-white hover:text-cyan-400 transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </Link>
        </div>
        <GlobalSearch03 tenantSlug={tenantSlug} />
      </header>

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-white/10 bg-[#050505] z-50 py-8 px-6 overflow-y-auto font-sans">
        <div className="mb-8">
          <Link href="/" className="flex flex-col gap-4 group">
            {storeInfo?.logo ? (
              <img src={storeInfo.logo} alt="Logo" className="w-16 h-16 rounded-none border border-white/20 p-1 bg-white/5 group-hover:border-cyan-400 transition-colors" />
            ) : (
              <div className="w-12 h-12 border border-white/20 bg-white/5 flex items-center justify-center font-bold text-xl group-hover:border-cyan-400 transition-colors">03</div>
            )}
            <span className="font-black text-xl tracking-tighter uppercase leading-none text-white group-hover:text-cyan-400 transition-colors">{storeInfo?.name || 'Premium Store'}</span>
          </Link>
        </div>

        <div className="mb-8">
          <GlobalSearch03 tenantSlug={tenantSlug} />
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">Navigation</h4>
          <Link href="/" className="flex items-center justify-between group py-3 border-b border-white/5 hover:border-cyan-400 transition-colors">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
              <Home className="w-4 h-4 text-cyan-400 opacity-50 group-hover:opacity-100" />
              <span>Index</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </Link>
          <Link href="/categories" className="flex items-center justify-between group py-3 border-b border-white/5 hover:border-cyan-400 transition-colors">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
              <Grid className="w-4 h-4 text-cyan-400 opacity-50 group-hover:opacity-100" />
              <span>Catalog</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </Link>
          <div className="mt-auto pt-8">
            <Link href="/cart" className="flex items-center justify-between group py-3 border-t border-b border-white/5 hover:border-cyan-400 transition-colors">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                <ShoppingCart className="w-4 h-4 text-cyan-400 opacity-50 group-hover:opacity-100" />
                <span>Cart</span>
              </div>
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-none shadow-[0_0_8px_#22d3ee] group-hover:scale-150 transition-all" />
            </Link>
          </div>
        </nav>

        <div className="mt-8 pt-8 border-t border-white/10 text-[9px] uppercase tracking-widest text-gray-600 font-mono">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-none animate-pulse" />
            SYS.STATUS: ONLINE
          </div>
          <div>VERSION: 3.0.0</div>
        </div>
      </aside>
    </>
  );
}
