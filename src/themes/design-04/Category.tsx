import { storefrontFetch } from "../../utils/storefrontFetch";
import { headers } from 'next/headers';
import Link from 'next/link';
import { getTranslation } from '@/utils/translations';
import type { Metadata, ResolvingMetadata } from 'next';
import FilterSidebar04 from './components/ui/FilterSidebar';
import FilterDrawer from './components/ui/FilterDrawer';
import SortSelect04 from './components/ui/SortSelect';
import ViewToggle04 from './components/ui/ViewToggle';
import Pagination04 from './components/ui/Pagination';
import ProductCard04 from './components/ui/ProductCard';
import Header04 from './components/layout/Header';
import Footer04 from './components/layout/Footer';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    return res.ok ? (await res.json()).data : null;
  } catch { return null; }
}

async function getFilteredProducts(tenantSlug: string, categoryId: string, searchParams: any) {
  try {
    const query = new URLSearchParams({ categoryId });
    if (searchParams.minPrice) query.set('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) query.set('maxPrice', searchParams.maxPrice);
    if (searchParams.search) query.set('search', searchParams.search);
    if (searchParams.page) query.set('page', searchParams.page);
    if (searchParams.sort) query.set('sort', searchParams.sort);
    if (searchParams.brand) query.set('brand', searchParams.brand);
    if (searchParams.inStock) query.set('inStock', searchParams.inStock);

    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products?${query.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    return (await res.json()).data || { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  } catch { return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } }; }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  const storeInfo = await getStoreInfo(tenantSlug);
  const categoriesRes = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`).then(r => r.json()).catch(() => null);
  const category = (categoriesRes?.data || []).find((c: any) => c.slug === resolvedParams.slug || c._id === resolvedParams.slug);

  if (!category) return { title: 'Category Not Found' };
  return { title: `${category.name} | ${storeInfo?.name || tenantSlug}` };
}

export default async function CategoryPage04({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedParams.slug;
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [storeInfo, categoriesRes, themeRes] = await Promise.all([
    getStoreInfo(tenantSlug),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } }).then(r => r.json()),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 60 } }).then(r => r.json())
  ]);

  const categories = categoriesRes?.data || [];
  const decodedCategorySlug = decodeURIComponent(categorySlug);
  const category = categories.find((c: any) => c.slug === decodedCategorySlug || c._id === decodedCategorySlug);
  const categoryId = category?._id;
  const theme = themeRes?.data;

  const [productResponse, brandsRes] = categoryId 
    ? await Promise.all([
        getFilteredProducts(tenantSlug, categoryId, resolvedSearchParams),
        storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/brands?categoryId=${categoryId}`, { next: { revalidate: 60 } }).then(r => r.json())
      ])
    : [{ data: [], pagination: { total: 0, page: 1, totalPages: 1 } }, { data: [] }];
  
  const products = productResponse.data || [];
  const availableBrands = brandsRes?.data || [];
  const pagination = productResponse.pagination || { total: 0, page: 1, totalPages: 1 };
  const isListView = resolvedSearchParams.view === 'list';

  const language = storeInfo?.language || 'en';
  const t = (key: any) => getTranslation(language, key);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header04 storeInfo={storeInfo} />

      {/* Banner */}
      <div className="bg-white border-b border-gray-100 py-6 sm:py-12 px-6 text-center">
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2 sm:mb-4">{category?.name || 'Shop'}</h1>
        <div className="flex items-center justify-center text-xs sm:text-sm font-semibold text-gray-400 gap-2">
          <Link prefetch={false} href="/" className="hover:text-gray-900 transition-colors">{t('home') || 'Home'}</Link>
          <span>/</span>
          <span className="text-gray-900">{category?.name}</span>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 py-6 sm:py-12 flex-1 w-full flex flex-col lg:flex-row gap-4 lg:gap-10">
        <aside className="hidden lg:block w-[280px] shrink-0">
          <FilterSidebar04 categoryId={categoryId} availableBrands={availableBrands} theme={theme} />
        </aside>

        <div className="lg:hidden">
          <FilterDrawer categoryId={categoryId} availableBrands={availableBrands} theme={theme} />
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
      </main>
      <Footer04 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
