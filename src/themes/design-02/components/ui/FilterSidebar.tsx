'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';

export default function Design02FilterSidebar({ categoryId, availableBrands = [] }: { categoryId: string, availableBrands?: string[] }) {
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
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
    setBrand('');
    setInStock(false);
    router.push(`/category/${categoryId}`);
  };

  return (
    <div className="bg-white p-6 border-r border-gray-100 h-fit sticky top-24">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-8">Filters</h3>
      
      <form onSubmit={applyFilters} className="space-y-8">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Search Products</label>
          <input 
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-transparent rounded-none px-4 py-3 text-sm focus:outline-none focus:border-gray-300 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Price Range (Tk)</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="Min" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-gray-50 border border-transparent rounded-none px-4 py-3 text-sm focus:outline-none focus:border-gray-300 transition-colors"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-gray-50 border border-transparent rounded-none px-4 py-3 text-sm focus:outline-none focus:border-gray-300 transition-colors"
            />
          </div>
        </div>

        {availableBrands.length > 0 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Brand</label>
            <div className="flex flex-wrap gap-2">
              {availableBrands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(brand === b ? '' : b)}
                  className={`px-4 py-2 text-xs uppercase tracking-wider rounded-none border transition-colors ${
                    brand === b
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 bg-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            id="inStock"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="w-4 h-4 text-gray-900 bg-gray-50 border-gray-300 rounded-none focus:ring-gray-900 focus:ring-1"
          />
          <label htmlFor="inStock" className="text-xs font-semibold uppercase tracking-wider text-gray-700 cursor-pointer">
            In Stock Only
          </label>
        </div>

        <div className="pt-4 flex gap-4">
          <button 
            type="submit" 
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-none text-sm transition-colors"
          >
            Apply
          </button>
          <button 
            type="button" 
            onClick={clearFilters}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 rounded-none text-sm transition-colors"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
