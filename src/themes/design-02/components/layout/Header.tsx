import Link from 'next/link';
import { headers } from 'next/headers';
import GlobalSearch from '../ui/GlobalSearch';

export default async function Header({ storeInfo }: { storeInfo: any }) {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  return (
    <header className="py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          <Link href="/" className="flex items-center gap-3">
            {storeInfo?.logo && (
              <img src={storeInfo.logo} alt={storeInfo?.name || 'Minimal Store'} className="w-8 h-8 rounded-full object-cover" />
            )}
            <span>{storeInfo?.name || 'Minimal Store'}</span>
          </Link>
        </h1>
        
        {/* Search Bar - Full width on mobile, centered on desktop */}
        <div className="w-full md:flex-1 md:max-w-xl mx-4">
          <GlobalSearch tenantSlug={tenantSlug} />
        </div>
        <nav className="space-x-8 text-sm font-medium hidden md:block">
          <Link href="/" className="hover:text-gray-500 transition-colors">Home</Link>
          <Link href="/categories" className="hover:text-gray-500 transition-colors">Shop</Link>
          <Link href="/cart" className="hover:text-gray-500 transition-colors flex items-center inline-flex gap-1">
            Cart
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
}
