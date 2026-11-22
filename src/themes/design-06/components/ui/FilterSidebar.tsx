'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { getTranslation } from '@/utils/translations';

export default function FilterSidebar06({
  categoryId,
  availableBrands = [],
  theme,
  onApply,
}: {
  categoryId?: string;
  availableBrands?: string[];
  theme?: any;
  onApply?: () => void;
}) {
  const language = theme?.language || 'en';
  const t = (key: any) => getTranslation(language || 'en', key);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');

  const applyFilters = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    if (brand) params.set('brand', brand);
    else params.delete('brand');
    if (inStock) params.set('inStock', 'true');
    else params.delete('inStock');

    params.set('page', '1');
    const basePath = categoryId ? `/category/${categoryId}` : pathname;
    router.push(`${basePath}?${params.toString()}`);
    if (onApply) onApply();
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setBrand('');
    setInStock(false);
    const basePath = categoryId ? `/category/${categoryId}` : pathname;
    router.push(basePath);
    if (onApply) onApply();
  };

  const hasActiveFilters = Boolean(minPrice || maxPrice || brand || inStock);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          Filter Collection
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-gray-400 hover:text-black flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <form onSubmit={applyFilters} className="space-y-6">
        {/* Availability */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-3">Availability</label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700 select-none">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black"
            />
            <span>In Stock Only</span>
          </label>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-3">
            Price Range ({theme?.currencySymbol || '৳'})
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Brand */}
        {availableBrands.length > 0 && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-3">Designer / Brand</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {availableBrands.map((b) => (
                <label key={b} className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700 select-none">
                  <input
                    type="radio"
                    name="brand"
                    value={b}
                    checked={brand === b}
                    onChange={() => setBrand(b)}
                    className="w-4 h-4 text-black focus:ring-black accent-black"
                  />
                  <span className="truncate">{b}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-black hover:bg-gray-800 text-white rounded-full text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          Apply Filters
        </button>
      </form>
    </div>
  );
}
