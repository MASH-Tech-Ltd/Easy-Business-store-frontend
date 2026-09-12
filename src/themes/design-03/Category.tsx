import { headers } from 'next/headers';
import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import FilterSidebar03 from './components/ui/FilterSidebar';
import SortSelect03 from './components/ui/SortSelect';
import ViewToggle03 from './components/ui/ViewToggle';
import Pagination03 from './components/ui/Pagination';
import FilterDrawer from './components/ui/FilterDrawer';
import Design03ProductCard from './components/ui/ProductCard';
import Header03 from './components/layout/Header';
import Footer03 from './components/layout/Footer';
import { getTheme } from '@/core/api/store';

async function getStoreInfo(tenantSlug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products?${query.toString()}`, { next: { revalidate: 60 } });
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
  const [storeInfo, categoriesRes] = await Promise.all([
    getStoreInfo(tenantSlug),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } }).then(res => res.json().catch(() => null)).catch(() => null)
  ]);
  const categories = categoriesRes?.data || [];
  const category = categories.find((c: any) => c.slug === resolvedParams.slug || c._id === resolvedParams.slug);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category.name} | ${storeInfo?.name || tenantSlug.toUpperCase()}`,
    description: category.description || `Browse our collection of ${category.name}`,
  };
}

export default async function Design03CategoryPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedParams.slug;

  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [storeInfo, categoriesRes, theme] = await Promise.all([
    getStoreInfo(tenantSlug),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 60 } }).then(res => res.json()),
    getTheme(tenantSlug)
  ]);

  const categories = categoriesRes?.data || [];
  const category = categories.find((c: any) => c.slug === categorySlug || c._id === categorySlug);
  const categoryId = category?._id;

  const [productResponse, brandsRes] = categoryId
    ? await Promise.all([
        getFilteredProducts(tenantSlug, categoryId, resolvedSearchParams),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/brands?categoryId=${categoryId}`, { next: { revalidate: 60 } }).then(res => res.json())
      ])
    : [{ data: [], pagination: { total: 0, page: 1, totalPages: 1 } }, { data: [] }];

  const products = productResponse.data || [];
  const availableBrands = brandsRes?.data || [];
  const pagination = productResponse.pagination || { total: 0, page: 1, totalPages: 1 };
  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-cyan-500/30">
      <Header03 storeInfo={storeInfo} />

      <main className="lg:ml-64 flex flex-col min-h-screen border-l border-white/10 bg-[#050505]">
        
        {/* Breadcrumbs - Brutalist */}
        <div className="w-full px-8 py-4 flex items-center text-xs font-mono uppercase tracking-widest text-gray-500 gap-3 border-b border-white/10 bg-black">
          <Link href="/" className="hover:text-cyan-400 transition-colors">ROOT</Link>
          <span className="text-white/20">/</span>
          <span className="text-white">{category?.name || 'CATALOG'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] flex-1">
          {/* Sidebar */}
          <aside className="hidden lg:block border-r border-white/10 bg-black">
            <FilterSidebar03 categoryId={categoryId} availableBrands={availableBrands} />
          </aside>

          {/* Mobile Filter Drawer Toggle */}
          <div className="lg:hidden">
            <FilterDrawer categoryId={categoryId} availableBrands={availableBrands} />
          </div>

          {/* Product Grid */}
          <section className="flex flex-col h-full bg-[#050505]">
            <div className="p-8 md:p-12 border-b border-white/10 bg-black">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 text-cyan-400">{category?.name || 'CATALOG'}</h2>
              {category?.description && <p className="text-gray-400 font-mono text-sm max-w-2xl">{category.description}</p>}
            </div>

            <div className="p-4 md:px-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/50">
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                [ RECORDS LOCATED: {products.length} / {pagination.total} ]
              </div>
              <div className="flex items-center gap-4">
                <SortSelect03 />
                <ViewToggle03 />
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-24 text-red-500 font-mono text-xs uppercase tracking-widest flex items-center justify-center flex-col gap-4">
                <span className="text-4xl">!</span>
                QUERY RETURNED 0 RESULTS
              </div>
            ) : (
              <div className="flex flex-col flex-1">
                <div className={resolvedSearchParams.view === 'list' ? 'flex flex-col border-b border-white/10' : 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 border-b border-white/10'}>
                  {products.map((product: any, idx: number) => (
                    <div key={product._id || product.id} className={resolvedSearchParams.view === 'list' ? 'border-b border-white/10 last:border-b-0' : `border-b sm:border-r border-white/10 ${idx % 3 === 2 ? 'lg:border-r-0' : ''}`}>
                      <Design03ProductCard product={product} isList={resolvedSearchParams.view === 'list'} theme={theme} />
                    </div>
                  ))}
                </div>
                {totalPages > 0 && (
                  <div className="p-8 flex justify-center bg-black border-t border-white/10 mt-auto">
                    <Pagination03 currentPage={currentPage} totalPages={totalPages} />
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <Footer03 storeInfo={storeInfo} theme={theme} />
      </main>
    </div>
  );
}
