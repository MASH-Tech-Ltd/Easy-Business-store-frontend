'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';

export default function FilterSidebar03({ categoryId, availableBrands = [] }: { categoryId: string; availableBrands?: string[] }) {
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
    router.push(`/category/${categoryId}?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice(''); setMaxPrice(''); setSearch(''); setBrand(''); setInStock(false);
    router.push(`/category/${categoryId}`);
  };

  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl h-fit sticky top-24">
      <h3 className="text-base font-bold text-white mb-6 uppercase tracking-wider">Filters</h3>
      <form onSubmit={applyFilters} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search</label>
          <input
            type="text" placeholder="e.g. Pro, Ultra" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price Range ({theme?.currencySymbol || '৳'})</label>
          <div className="flex items-center gap-2">
            <input
              type="number" placeholder="Min" value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition-all"
            />
            <span className="text-gray-600">–</span>
            <input
              type="number" placeholder="Max" value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition-all"
            />
          </div>
        </div>

        {availableBrands.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Brand</label>
            <div className="flex flex-wrap gap-2">
              {availableBrands.map((b) => (
                <button
                  key={b} type="button"
                  onClick={() => setBrand(brand === b ? '' : b)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${brand === b ? 'border-white bg-white text-black' : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white bg-transparent'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="checkbox" id="inStock03" checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="w-4 h-4 rounded bg-white/5 border-white/10"
          />
          <label htmlFor="inStock03" className="text-sm font-semibold text-gray-400 cursor-pointer hover:text-white transition-colors">In Stock Only</label>
        </div>

        <div className="pt-2 flex gap-3">
          <button type="submit" className="flex-1 bg-white text-black font-bold py-2.5 rounded-lg text-sm hover:bg-gray-200 transition-colors">Apply</button>
          <button type="button" onClick={clearFilters} className="flex-1 bg-white/5 border border-white/10 text-gray-400 font-bold py-2.5 rounded-lg text-sm hover:bg-white/10 hover:text-white transition-all">Clear</button>
        </div>
      </form>
    </div>
  );
}
