import { storefrontFetch } from "../../utils/storefrontFetch";
import { headers } from 'next/headers';
import Link from 'next/link';
import Design02FilterDrawer from './components/ui/FilterDrawer';
import SortSelect from './components/ui/SortSelect';
import ViewToggle from './components/ui/ViewToggle';
import Pagination from './components/ui/Pagination';
import Design02ProductCard from './components/ui/ProductCard';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { getStoreInfo, getTheme } from '@/core/api/store';
import { getTranslation } from '@/utils/translations';

async function getAllProducts(tenantSlug: string, searchParams: any) {
  try {
    const query = new URLSearchParams();
    if (searchParams.minPrice) query.set('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) query.set('maxPrice', searchParams.maxPrice);
    if (searchParams.search) query.set('search', searchParams.search);
    if (searchParams.page) query.set('page', searchParams.page);
    if (searchParams.limit) query.set('limit', searchParams.limit || '20');
    if (searchParams.sort) query.set('sort', searchParams.sort);
    if (searchParams.brand) query.set('brand', searchParams.brand);
    if (searchParams.inStock) query.set('inStock', searchParams.inStock);

    const res = await storefrontFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products?${query.toString()}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    const json = await res.json();
    return json.data || { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  } catch (error) {
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }
}

export default async function Design02ProductsPage({ searchParams }: any) {
  const resolvedSearchParams = await (searchParams || {});
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [storeInfo, theme, productResponse, brandsRes, categoriesRes] = await Promise.all([
    getStoreInfo(tenantSlug),
    getTheme(tenantSlug),
    getAllProducts(tenantSlug, resolvedSearchParams),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/brands`, { next: { revalidate: 60 } })
      .then(res => res.json())
      .catch(() => ({ data: [] })),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } })
      .then(res => res.json())
      .catch(() => ({ data: [] })),
  ]);

  const products = productResponse.data || [];
  const availableBrands = brandsRes?.data || [];
  const categories = categoriesRes?.data || [];
  const pagination = productResponse.pagination || { total: 0, page: 1, totalPages: 1 };

  const language = storeInfo?.language || 'en';
  const t = (key: any) => getTranslation(language, key);

  const currentPage = pagination.page || 1;
  const totalPages = pagination.totalPages || 1;
  const isListView = resolvedSearchParams.view === 'list';

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <Header storeInfo={storeInfo} />

      {/* Breadcrumb & Title Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-14 text-center border-b border-gray-50">
        <div className="text-xs font-medium text-gray-400 mb-4 sm:mb-6 uppercase tracking-widest">
          <Link prefetch={true} href="/" className="hover:text-gray-900 transition-colors">
            {t('home') || 'Home'}
          </Link>
          <span className="mx-3">/</span>
          <span className="text-gray-900 font-semibold">{t('allProducts') || 'All Products'}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">
          {t('allProducts') || 'All Products'}
        </h1>
        <p className="mt-4 text-gray-500 font-light max-w-2xl mx-auto text-sm sm:text-base">
          Browse our entire curated catalog with premium quality and instant delivery.
        </p>

        {/* Category Pills Bar */}
        {categories.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            <Link
              prefetch={true}
              href="/products"
              className="px-4 py-2 text-xs uppercase tracking-wider rounded-full border transition-all bg-gray-900 border-gray-900 text-white shadow-sm font-medium"
            >
              All
            </Link>
            {categories.map((c: any) => (
              <Link
                prefetch={true}
                key={c._id}
                href={`/category/${c.slug || c._id}`}
                className="px-4 py-2 text-xs uppercase tracking-wider rounded-full border transition-all border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 bg-white shadow-sm font-medium"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Design02FilterDrawer categoryId="" availableBrands={availableBrands} theme={theme} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12 flex-1 w-full flex flex-col gap-6 sm:gap-12">
        {/* Product Grid & Controls */}
        <section className="flex flex-col h-full w-full">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center pb-3 border-b border-gray-100 gap-4 md:gap-0">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-500">
                Showing <span className="font-semibold text-gray-900">{products.length}</span> of <span className="font-semibold text-gray-900">{pagination.total}</span> products
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 justify-between md:justify-end w-full md:w-auto">
              <SortSelect />
              <ViewToggle />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-28 text-gray-400 font-light text-lg">
              No products found matching your criteria.
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              <div
                className={
                  isListView
                    ? "flex flex-col gap-6 mb-12"
                    : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-8 sm:gap-y-12 mb-12"
                }
              >
                {products.map((product: any) => (
                  <Design02ProductCard
                    key={product._id || product.id}
                    product={product}
                    isList={isListView}
                    theme={theme}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="border-t border-gray-100 pt-8 mt-auto">
                  <Pagination currentPage={currentPage} totalPages={totalPages} />
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
