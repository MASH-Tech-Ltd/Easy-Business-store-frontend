import { storefrontFetch } from "../../utils/storefrontFetch";
import { headers } from 'next/headers';
import Link from 'next/link';
import FilterSidebar04 from './components/ui/FilterSidebar';
import SortSelect04 from './components/ui/SortSelect';
import ViewToggle04 from './components/ui/ViewToggle';
import Pagination04 from './components/ui/Pagination';
import ProductCard04 from './components/ui/ProductCard';
import Header04 from './components/layout/Header';
import Footer04 from './components/layout/Footer';
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
    query.set('limit', '50'); // User requested limit 50 per load
    if (searchParams.sort) query.set('sort', searchParams.sort);
    if (searchParams.brand) query.set('brand', searchParams.brand);
    if (searchParams.inStock) query.set('inStock', searchParams.inStock);

    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products?${query.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    return (await res.json()).data || { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  } catch { return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } }; }
}

export default async function ProductsPage04({ searchParams }: any) {

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
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header04 storeInfo={storeInfo} />

      {/* Banner */}
      <div className="bg-white border-b border-gray-100 py-12 px-6 text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">{t('allProducts') || 'All Products'}</h1>
        <div className="flex items-center justify-center text-sm font-semibold text-gray-400 gap-2">
          <Link prefetch={false} href="/" className="hover:text-gray-900 transition-colors">{t('home') || 'Home'}</Link>
          <span>/</span>
          <span className="text-gray-900">Products</span>
        </div>
      </div>

      <main className="max-w-[1400px]  mx-auto px-6 py-12 flex-1 w-full">
        {/* Categories Bar */}
        {categories.length > 0 && (
          <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 text-center">{t('categories') || 'Categories'}</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <Link prefetch={false} href="/products" className="px-4 py-2 text-sm rounded-full border font-semibold transition-all bg-gray-900 border-gray-900 text-white shadow-sm">
                All
              </Link>
              {categories.map((c: any) => (
                <Link prefetch={false} key={c._id} href={`/category/${c.slug || c._id}`}
                  className="px-4 py-2 text-sm rounded-full border font-semibold transition-all border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 bg-white shadow-sm">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="hidden lg:block w-[280px] shrink-0">
            <FilterSidebar04 availableBrands={availableBrands} theme={theme} />
          </aside>

          <div className="lg:hidden">
            <FilterDrawer categoryId="" availableBrands={availableBrands} theme={theme} />
          </div>

        <section className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 gap-4">
            <span className="text-sm font-semibold text-gray-500">Showing <span className="text-gray-900">{products.length}</span> of {pagination.total} results</span>
            <div className="flex items-center gap-4">
              <SortSelect04 />
              <div className="w-px h-6 bg-gray-200"></div>
              <ViewToggle04 />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-500 font-semibold shadow-sm">
              No products found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <div className={isListView ? "flex flex-col gap-4" : "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5"}>
                {products.map((p: any) => (
                  <ProductCard04 key={p._id || p.id} product={p} isList={isListView} theme={theme} />
                ))}
              </div>
              <Pagination04 currentPage={pagination.page} totalPages={pagination.totalPages} />
            </>
          )}
        </section>
        </div>
      </main>
      <Footer04 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
