import { storefrontFetch } from '../../utils/storefrontFetch';
import { headers } from 'next/headers';
import Link from 'next/link';
import FilterSidebar06 from './components/ui/FilterSidebar';
import SortSelect06 from './components/ui/SortSelect';
import ViewToggle06 from './components/ui/ViewToggle';
import Pagination06 from './components/ui/Pagination';
import ProductCard06 from './components/ui/ProductCard';
import Header06 from './components/layout/Header';
import Footer06 from './components/layout/Footer';
import FilterDrawer06 from './components/ui/FilterDrawer';
import { getTranslation } from '@/utils/translations';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    return res.ok ? (await res.json()).data : null;
  } catch {
    return null;
  }
}

async function getAllProducts(tenantSlug: string, searchParams: any) {
  try {
    const query = new URLSearchParams();
    if (searchParams.minPrice) query.set('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) query.set('maxPrice', searchParams.maxPrice);
    if (searchParams.search) query.set('search', searchParams.search);
    if (searchParams.page) query.set('page', searchParams.page);
    query.set('limit', '24');
    const safeSort = searchParams.sort === 'price-asc' ? 'price_asc' : searchParams.sort === 'price-desc' ? 'price_desc' : searchParams.sort;
    if (safeSort) query.set('sort', safeSort);
    if (searchParams.brand) query.set('brand', searchParams.brand);
    if (searchParams.inStock) query.set('inStock', searchParams.inStock);

    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products?${query.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    return (await res.json()).data || { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  } catch {
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }
}

export default async function ProductsPage06({ searchParams }: any) {
  const resolvedSearchParams = await (searchParams || {});
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [storeInfo, themeRes, productResponse, brandsRes, categoriesRes] = await Promise.all([
    getStoreInfo(tenantSlug),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => ({ data: null })),
    getAllProducts(tenantSlug, resolvedSearchParams),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/brands`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => ({ data: [] })),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => ({ data: [] })),
  ]);

  const theme = themeRes?.data;
  const products = productResponse.data || [];
  const availableBrands = brandsRes?.data || [];
  const categories = categoriesRes?.data || [];
  const pagination = productResponse.pagination || { total: 0, page: 1, totalPages: 1 };
  const isListView = resolvedSearchParams.view === 'list';

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col text-gray-900">
      <Header06 storeInfo={storeInfo} />

      {/* Header Banner & Breadcrumbs */}
      <div className="bg-[#FAFAFA] border-b border-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto text-center">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-3">
            Shop All Collections
          </h1>
          <div className="flex items-center justify-center text-xs font-semibold text-gray-400 uppercase tracking-widest gap-2">
            <Link prefetch={false} href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900">Shop</span>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 flex-1 w-full">
        {/* Category Pills Slider if categories exist */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            <Link
              href="/products"
              prefetch={false}
              className="px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 bg-black text-white shadow-xs"
            >
              All Items
            </Link>
            {categories.map((c: any) => (
              <Link
                key={c._id}
                href={`/category/${c.slug || c._id}`}
                prefetch={false}
                className="px-4 py-1.5 rounded-full text-xs font-medium shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-8 border-b border-gray-100 gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="lg:hidden">
              <FilterDrawer06
                availableBrands={availableBrands}
                theme={theme}
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Showing <span className="font-semibold text-gray-900">{products.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{pagination.total || products.length}</span> items
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <SortSelect06 theme={theme} />
            <ViewToggle06 view={isListView ? 'list' : 'grid'} />
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar (291px) */}
          <aside className="hidden lg:block w-[291px] shrink-0">
            <FilterSidebar06
              availableBrands={availableBrands}
              theme={theme}
            />
          </aside>

          {/* Products Grid / List */}
          <div className="flex-1 min-w-0">
            {products.length === 0 ? (
              <div className="py-24 text-center bg-gray-50 rounded-2xl p-8">
                <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Try adjusting your filters or search terms.
                </p>
                <Link
                  href="/products"
                  className="inline-block px-6 py-2.5 bg-black text-white text-xs font-semibold rounded-full hover:bg-gray-800 transition-colors"
                >
                  Clear Filters
                </Link>
              </div>
            ) : isListView ? (
              <div className="space-y-4">
                {products.map((p: any) => (
                  <ProductCard06 key={p._id} product={p} isList={true} theme={theme} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {products.map((p: any) => (
                  <ProductCard06 key={p._id} product={p} theme={theme} />
                ))}
              </div>
            )}

            {/* Pagination */}
            <Pagination06
              currentPage={Number(resolvedSearchParams.page) || 1}
              totalPages={pagination.totalPages || 1}
            />
          </div>
        </div>
      </main>

      <Footer06 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
