import { storefrontFetch } from "../../utils/storefrontFetch";
import { headers } from 'next/headers';
import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import FilterSidebar from './components/ui/FilterSidebar';
import SortSelect from './components/ui/SortSelect';
import ViewToggle from './components/ui/ViewToggle';
import Pagination from './components/ui/Pagination';
import ProductCard from './components/ui/ProductCard';
import FilterDrawer from './components/ui/FilterDrawer';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { getTranslation } from '@/utils/translations';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 10 } });
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
    openGraph: {
      title: `${category.name} | ${storeInfo?.name || tenantSlug.toUpperCase()}`,
      description: category.description || `Browse our collection of ${category.name} at ${storeInfo?.name || tenantSlug.toUpperCase()}`,
    }
  };
}

export default async function CategoryPage({ params, searchParams }: any) {

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedParams.slug;
  
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  // First fetch categories and store info to find the actual category ID
  const [storeInfo, categoriesRes] = await Promise.all([
    getStoreInfo(tenantSlug),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } }).then(res => res.json())
  ]);

  const categories = categoriesRes?.data || [];
  const category = categories.find((c: any) => c.slug === categorySlug || c._id === categorySlug);
  
  const categoryId = category?._id;

  const language = storeInfo?.language || "en";
  const t = (key: any) => getTranslation(language, key);
  const theme = storeInfo?.theme || {};

  // Now fetch the products and brands with the correct categoryId
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
  
  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Header />
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center text-xs text-gray-500 font-semibold gap-2">
          <Link prefetch={false} href="/" className="hover:text-gray-900 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.99 9a.75.75 0 11-1.06 1.06l-4.635-4.643V20.25a.75.75 0 01-.75.75h-3.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5H3.75a.75.75 0 01-.75-.75V11.25l-2.025 2.025a.75.75 0 11-1.06-1.06l8.99-9zM12 5.093l-6.75 6.756v8.401h2.25v-4.5a2.25 2.25 0 012.25-2.25h4.5a2.25 2.25 0 012.25 2.25v4.5h2.25v-8.401L12 5.093z" />
            </svg>{t('home') || 'Home'}</Link>
          <span>&rarr;</span>
          <span className="text-gray-900">{category?.name || 'Category'}</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="hidden lg:block border-b border-gray-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-wrap gap-2 justify-center items-center">
          {categories.map((c: any) => {
            const isActive = c._id === categoryId;
            return (
              <Link prefetch={false} 
                key={c._id} 
                href={`/category/${c.slug}`}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  isActive 
                    ? 'border-primary text-primary bg-primary/5 font-semibold' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 py-12 flex-1 w-full grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        
        {/* Sidebar */}
        <aside className="hidden md:block">
          <FilterSidebar categoryId={categoryId} availableBrands={availableBrands} theme={theme} />
        </aside>

        {/* Mobile Filter Drawer Toggle */}
        <div className="md:hidden">
          <FilterDrawer categoryId={categoryId} availableBrands={availableBrands} theme={theme} />
        </div>

        {/* Product Grid */}
        <section className="flex flex-col h-full">
          <div className="mb-6 flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {category?.name || 'Category'}
            </h2>
            <div className="flex items-center gap-4 border border-gray-200 rounded-md py-1 px-3 bg-gray-50">
              <div className="text-sm font-semibold text-gray-500 mr-2">
                {pagination.total} Products Found
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <SortSelect />
              <div className="h-4 w-px bg-gray-300"></div>
              <ViewToggle />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-32 bg-gray-50 rounded-xl border border-gray-100 text-gray-500 font-medium">
              No products match your filters.
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              <div className={
                resolvedSearchParams.view === 'list' 
                  ? "flex flex-col gap-4 mb-10" 
                  : "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10"
              }>
                {products.map((product: any) => (
                  <ProductCard 
                    key={product._id || product.id} 
                    product={product} 
                    isList={resolvedSearchParams.view === 'list'} 
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
