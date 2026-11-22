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

export default async function CategoryPage06({ params, searchParams }: any) {
  const resolvedParams = await (params || {});
  const resolvedSearchParams = await (searchParams || {});
  const rawCategoryId = resolvedParams.slug || resolvedParams.categoryId;
  const categoryId = rawCategoryId ? decodeURIComponent(rawCategoryId) : '';

  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [storeInfoRes, themeRes, categoriesRes] = await Promise.all([
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } }),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 60 } }),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } }),
  ]);

  const storeInfo = storeInfoRes.ok ? (await storeInfoRes.json()).data : null;
  const theme = themeRes.ok ? (await themeRes.json()).data : null;
  const categoriesData = categoriesRes.ok ? (await categoriesRes.json()).data || [] : [];

  const categoryData = categoriesData.find(
    (c: any) => c.slug === categoryId || c._id === categoryId
  );
  const realCategoryId = categoryData?._id || categoryId;

  const fetchCategoryProducts = async (cId: string) => {
    try {
      const query = new URLSearchParams();
      if (resolvedSearchParams.minPrice) query.set('minPrice', resolvedSearchParams.minPrice);
      if (resolvedSearchParams.maxPrice) query.set('maxPrice', resolvedSearchParams.maxPrice);
      if (resolvedSearchParams.search) query.set('search', resolvedSearchParams.search);
      if (resolvedSearchParams.page) query.set('page', resolvedSearchParams.page);
      query.set('limit', '24');
      const safeSort = resolvedSearchParams.sort === 'price-asc' ? 'price_asc' : resolvedSearchParams.sort === 'price-desc' ? 'price_desc' : resolvedSearchParams.sort;
      if (safeSort) query.set('sort', safeSort);
      if (resolvedSearchParams.brand) query.set('brand', resolvedSearchParams.brand);
      if (resolvedSearchParams.inStock) query.set('inStock', resolvedSearchParams.inStock);

      if (cId) query.set('categoryId', cId);

      const res = await storefrontFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products?${query.toString()}`,
        { next: { revalidate: 60 } }
      );
      if (!res.ok) return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
      return (await res.json()).data || { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    } catch {
      return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    }
  };

  const productResponse = await fetchCategoryProducts(realCategoryId);
  const products = productResponse.data || [];
  const pagination = productResponse.pagination || { total: 0, page: 1, totalPages: 1 };
  const isListView = resolvedSearchParams.view === 'list';

  // Extract available brands
  const brands = Array.from(new Set(products.map((p: any) => p.brand).filter(Boolean))) as string[];

  const categoryName = categoryData?.name || 'Collection';

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col text-gray-900">
      <Header06 storeInfo={storeInfo} />

      {/* Header Banner & Breadcrumbs */}
      <div className="bg-[#FAFAFA] border-b border-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto text-center">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-3">
            {categoryName}
          </h1>
          <div className="flex items-center justify-center text-xs font-semibold text-gray-400 uppercase tracking-widest gap-2">
            <Link prefetch={false} href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link prefetch={false} href="/categories" className="hover:text-black transition-colors">
              Categories
            </Link>
            <span>/</span>
            <span className="text-gray-900">{categoryName}</span>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 flex-1 w-full">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-8 border-b border-gray-100 gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="lg:hidden">
              <FilterDrawer06
                categoryId={categoryId}
                availableBrands={brands}
                theme={theme}
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Showing <span className="font-semibold text-gray-900">{products.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{pagination.total || products.length}</span> products
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
              categoryId={categoryId}
              availableBrands={brands}
              theme={theme}
            />
          </aside>

          {/* Product Grid / List */}
          <div className="flex-1 min-w-0">
            {products.length === 0 ? (
              <div className="py-24 text-center bg-gray-50 rounded-2xl p-8">
                <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Try adjusting your filters or search criteria.
                </p>
                <Link
                  href={`/category/${categoryId}`}
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
