import Link from "next/link";
import { headers } from "next/headers";
import { storefrontFetch } from "@/utils/storefrontFetch";

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`,
      { next: { revalidate: 0 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

export default async function NotFound() {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug") || "Store";
  
  const storeInfo = await getStoreInfo(tenantSlug);
  const storeName = storeInfo?.name || (tenantSlug === 'main' ? 'our store' : tenantSlug);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-2xl w-full text-center p-8 md:p-12 border border-gray-200/20 dark:border-gray-800/50 rounded-3xl shadow-2xl backdrop-blur-md relative overflow-hidden" style={{ background: 'var(--background)' }}>
        {/* Decorative background blobs using tenant's primary color */}
        <div 
          className="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-3xl opacity-10" 
          style={{ backgroundColor: 'var(--primary-color)' }}
        ></div>
        <div 
          className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-10" 
          style={{ backgroundColor: 'var(--primary-color)' }}
        ></div>
        
        <div className="relative z-10">
          <div className="mb-6 relative inline-block">
            <h1 
              className="text-[120px] md:text-[150px] font-black leading-none select-none text-primary"
              style={{ opacity: 0.15 }}
            >
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-primary text-[var(--primary-foreground)] text-xs md:text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg transform -rotate-12">
                Missing
              </span>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Page Not Found
          </h2>
          
          <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed text-lg">
            We couldn't find the page you were looking for on <strong>{storeName}</strong>. It may have been moved or removed.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </Link>
            
            <Link
              href="/products"
              className="w-full sm:w-auto px-8 py-3.5 border border-gray-300 dark:border-gray-700 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-800 dark:hover:text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
