import { storefrontFetch } from "../../utils/storefrontFetch";
import { headers } from 'next/headers';
import Link from 'next/link';
import FilterSidebar05 from './components/ui/FilterSidebar';
import SortSelect05 from './components/ui/SortSelect';
import ViewToggle05 from './components/ui/ViewToggle';
import Pagination05 from './components/ui/Pagination';
import ProductCard05 from './components/ui/ProductCard';
import Header05 from './components/layout/Header';
import Footer05 from './components/layout/Footer';
import FilterDrawer from './components/ui/FilterDrawer';
import { getTranslation } from '@/utils/translations';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    return res.ok ? (await res.json()).data : null;
  } catch { return null; }
}

async function getAllProducts(tenantSlug: string, searchParams: any) {
  try {
    const query = new URLSearchParams();
    if (searchParams.minPrice) query.set('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) query.set('maxPrice', searchParams.maxPrice);
    if (searchParams.search) query.set('search', searchParams.search);
    if (searchParams.page) query.set('page', searchParams.page);
    query.set('limit', '50');
    if (searchParams.sort) query.set('sort', searchParams.sort);
    if (searchParams.brand) query.set('brand', searchParams.brand);
    if (searchParams.inStock) query.set('inStock', searchParams.inStock);

    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products?${query.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    return (await res.json()).data || { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  } catch { return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } }; }
}

export default async function ProductsPage05({ searchParams }: any) {

  const resolvedSearchParams = await (searchParams || {});
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [storeInfo, themeRes, productResponse, brandsRes, categoriesRes] = await Promise.all([
    getStoreInfo(tenantSlug),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 60 } }).then(r => r.json()),
    getAllProducts(tenantSlug, resolvedSearchParams),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/brands`, { next: { revalidate: 60 } }).then(r => r.json()),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } }).then(r => r.json())
  ]);
  const language = storeInfo?.language || "en";
  const t = (key: any) => getTranslation(language || 'en', key);


  const theme = themeRes?.data;
  const products = productResponse.data || [];
  const availableBrands = brandsRes?.data || [];
  const categories = categoriesRes?.data || [];
  const pagination = productResponse.pagination || { total: 0, page: 1, totalPages: 1 };
  const isListView = resolvedSearchParams.view === 'list';

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header05 storeInfo={storeInfo} />

      <div className="pt-16 pb-8 px-6 lg:px-12 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">Collection</h1>
        <div className="flex items-center justify-center text-[13px] font-semibold text-gray-400 uppercase tracking-widest gap-3">
          <Link href="/" className="hover:text-black transition-colors">{t('home') || 'Home'}</Link>
          <span className="text-gray-300">/</span>
          <span className="text-black">Products</span>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 flex-1 w-full flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="hidden lg:block w-[260px] shrink-0">
          <FilterSidebar05 availableBrands={availableBrands} theme={theme} />
        </aside>

        {/* Mobile Filter Drawer Toggle */}
        <div className="lg:hidden">
          <FilterDrawer categoryId="" availableBrands={availableBrands} theme={theme} />
        </div>

        {/* Content */}
        <section className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-100 pb-6 mb-8 gap-4">
            <span className="text-sm font-medium text-gray-500">Showing <span className="text-black font-semibold">{products.length}</span> of {pagination.total}</span>
            <div className="flex items-center gap-6">
              <SortSelect05 />
              <div className="w-px h-6 bg-gray-200"></div>
              <ViewToggle05 />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="py-32 text-center flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-gray-200 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <>
              <div className={isListView ? "flex flex-col gap-6" : "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"}>
                {products.map((p: any) => (
                  <ProductCard05 key={p._id} product={p} isList={isListView} theme={theme} />
                ))}
              </div>
              <Pagination05 currentPage={Number(resolvedSearchParams.page) || 1} totalPages={pagination.totalPages} />
            </>
          )}
        </section>
      </main>

      <Footer05 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
