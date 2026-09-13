import { storefrontFetch } from "../../utils/storefrontFetch";
import { headers } from 'next/headers';
import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import Design02FilterDrawer from './components/ui/FilterDrawer';
import SortSelect from './components/ui/SortSelect';
import ViewToggle from './components/ui/ViewToggle';
import Pagination from './components/ui/Pagination';
import Design02ProductCard from './components/ui/ProductCard';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { getTheme } from '@/core/api/store';
import { getTranslation } from '@/utils/translations';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

async function getCategory(tenantSlug: string, categoryId: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data.find((c: any) => c._id === categoryId);
  } catch (error) {
    return null;
  }
}

async function getFilteredProducts(tenantSlug: string, categoryId: string, searchParams: any) {
  try {
    const query = new URLSearchParams({ categoryId });
    if (searchParams.minPrice) query.set('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) query.set('maxPrice', searchParams.maxPrice);
    if (searchParams.search) query.set('search', searchParams.search);
    if (searchParams.page) query.set('page', searchParams.page);
    if (searchParams.limit) query.set('limit', searchParams.limit);
    if (searchParams.sort) query.set('sort', searchParams.sort);
    if (searchParams.brand) query.set('brand', searchParams.brand);
    if (searchParams.inStock) query.set('inStock', searchParams.inStock);

    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products?${query.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    const json = await res.json();
    return json.data || { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  } catch (error) {
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  
  const [storeInfo, categoriesRes] = await Promise.all([
    getStoreInfo(tenantSlug),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } }).then(res => res.json().catch(() => null)).catch(() => null)
  ]);
  const language = storeInfo?.language || "en";
  const t = (key: any) => getTranslation(language || 'en', key);


  const categories = categoriesRes?.data || [];
  const category = categories.find((c: any) => c.slug === resolvedParams.slug || c._id === resolvedParams.slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }
  
  return {
    title: `${category.name} | ${storeInfo?.name || tenantSlug.toUpperCase()}`,
    description: category.description || `Browse our collection of ${category.name} at ${storeInfo?.name || tenantSlug.toUpperCase()}`,
  };
}

export default async function Design02CategoryPage({ params, searchParams }: any) {

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams || {};
  const categorySlug = resolvedParams.slug;
  
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [storeInfo, categoriesRes, theme] = await Promise.all([
    getStoreInfo(tenantSlug),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } }).then(res => res.json()),
    getTheme(tenantSlug)
  ]);

  const categories = categoriesRes?.data || [];
  const category = categories.find((c: any) => c.slug === categorySlug || c._id === categorySlug);
  
  const categoryId = category?._id;

  const [productResponse, brandsRes] = categoryId 
    ? await Promise.all([
        getFilteredProducts(tenantSlug, categoryId, resolvedSearchParams),
        storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/brands?categoryId=${categoryId}`, { next: { revalidate: 60 } }).then(res => res.json())
      ])
    : [
        { data: [], pagination: { total: 0, page: 1, totalPages: 1 } },
        { data: [] }
      ];
  
  const products = productResponse.data || [];
  const availableBrands = brandsRes?.data || [];
  const pagination = productResponse.pagination || { total: 0, page: 1, totalPages: 1 };

  const language = storeInfo?.language || 'en';
  const t = (key: any) => getTranslation(language, key);
  
  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <Header storeInfo={storeInfo} />

      {/* Breadcrumb & Title Area */}
      <div className="max-w-7xl mx-auto px-8 py-12 text-center border-b border-gray-50">
        <div className="text-xs font-medium text-gray-400 mb-6 uppercase tracking-widest">
          <Link href="/" className="hover:text-gray-900 transition-colors">{t('home') || 'Home'}</Link>
          <span className="mx-3">/</span>
          <span className="text-gray-900">{category?.name || 'Category'}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight">{category?.name || 'Category'}</h1>
        {category?.description && (
          <p className="mt-4 text-gray-500 font-light max-w-2xl mx-auto">{category.description}</p>
        )}
      </div>

      <Design02FilterDrawer categoryId={categoryId} availableBrands={availableBrands} />

      <main className="max-w-7xl mx-auto px-8 py-12 flex-1 w-full flex flex-col gap-12">
        
        {/* Product Grid */}
        <section className="flex flex-col h-full w-full">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-gray-100 gap-4 sm:gap-0">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-500">
                Showing {products.length} of {pagination.total} products
              </div>
            </div>
            <div className="flex items-center gap-6 self-end sm:self-auto">
              <SortSelect />
              <ViewToggle />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24 text-gray-400 font-light text-lg">
              No products found matching your criteria.
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              <div className={
                resolvedSearchParams.view === 'list' 
                  ? "flex flex-col gap-6 mb-12" 
                  : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-8 sm:gap-y-12 mb-12"
              }>
                {products.map((product: any) => (
                  <Design02ProductCard 
                    key={product._id || product.id} 
                    product={product} 
                    isList={resolvedSearchParams.view === 'list'} 
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
