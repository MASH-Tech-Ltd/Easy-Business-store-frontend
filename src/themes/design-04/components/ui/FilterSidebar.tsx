'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';

export default function FilterSidebar04({ categoryId, availableBrands = [] }: { categoryId?: string; availableBrands?: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');

  const applyFilters = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (search) params.set('search', search);
    if (brand) params.set('brand', brand);
    if (inStock) params.set('inStock', 'true');
    const basePath = categoryId ? `/category/${categoryId}` : '/products';
    router.push(`${basePath}?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice(''); setMaxPrice(''); setSearch(''); setBrand(''); setInStock(false);
    const basePath = categoryId ? `/category/${categoryId}` : '/products';
    router.push(basePath);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-24">
      <h3 className="text-base font-bold text-gray-900 mb-5">Filters</h3>
      <form onSubmit={applyFilters} className="space-y-5">

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Search</label>
          <input type="text" placeholder="Search products…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Price Range ({theme?.currencySymbol || '৳'})</label>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900" />
            <span className="text-gray-300">–</span>
            <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900" />
          </div>
        </div>

        {availableBrands.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Brand</label>
            <div className="flex flex-wrap gap-2">
              {availableBrands.map((b) => (
                <button key={b} type="button" onClick={() => setBrand(brand === b ? '' : b)}
                  className={`px-3 py-1.5 text-xs rounded-full border font-semibold transition-all ${brand === b ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-900 bg-white'}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="inStock04" checked={inStock} onChange={(e) => setInStock(e.target.checked)}
            className="w-4 h-4 rounded accent-gray-900" />
          <span className="text-sm font-medium text-gray-700">In Stock Only</span>
        </label>

        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 bg-gray-900 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors">Apply</button>
          <button type="button" onClick={clearFilters} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-200 transition-colors">Clear</button>
        </div>
      </form>
    </div>
  );
}
